import { head } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  getBlobCommandOptions,
  isVercelBlobConfigured,
} from "@/lib/blob-storage";

export type HealthStatus = "ok" | "warning" | "error";

export type HealthCategory =
  | "firebase"
  | "vercel"
  | "paginas"
  | "api"
  | "integraciones";

export interface HealthCheck {
  id: string;
  category: HealthCategory;
  name: string;
  status: HealthStatus;
  message: string;
  details?: string[];
}

export interface SystemHealthReport {
  checkedAt: string;
  environment: string;
  deploymentUrl: string | null;
  checks: HealthCheck[];
  summary: {
    ok: number;
    warning: number;
    error: number;
  };
}

const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const PUBLIC_PAGES = [
  { path: "/", label: "Inicio" },
  { path: "/productos", label: "Catálogo" },
  { path: "/contacto", label: "Contacto" },
  { path: "/iniciar-sesion", label: "Iniciar sesión" },
  { path: "/privacidad", label: "Privacidad" },
  { path: "/terminos", label: "Términos" },
] as const;

const PUBLIC_APIS = [
  { path: "/api/products", label: "Productos" },
  { path: "/api/catalog-config", label: "Configuración de catálogo" },
] as const;

const FETCH_TIMEOUT_MS = 8_000;

function getDeploymentBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (siteUrl) {
    return siteUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  const port = process.env.PORT?.trim() || "3000";
  return `http://localhost:${port}`;
}

function getRuntimeEnvironment(): string {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV;
  }

  return process.env.NODE_ENV ?? "development";
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function missingEnvVars(keys: readonly string[]): string[] {
  return keys.filter((key) => !process.env[key]?.trim());
}

function checkFirebaseEnv(): HealthCheck {
  const missing = missingEnvVars(FIREBASE_ENV_KEYS);

  if (missing.length === 0) {
    return {
      id: "firebase-env",
      category: "firebase",
      name: "Variables de entorno",
      status: "ok",
      message: "Todas las variables NEXT_PUBLIC_FIREBASE_* están definidas.",
    };
  }

  return {
    id: "firebase-env",
    category: "firebase",
    name: "Variables de entorno",
    status: "error",
    message: "Faltan variables de Firebase en el entorno.",
    details: missing,
  };
}

async function checkFirebaseAuthApi(): Promise<HealthCheck> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();

  if (!apiKey) {
    return {
      id: "firebase-auth",
      category: "firebase",
      name: "Authentication",
      status: "error",
      message: "No hay API key de Firebase para verificar Auth.",
    };
  }

  try {
    const response = await fetchWithTimeout(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(apiKey)}`,
    );

    if (!response.ok) {
      return {
        id: "firebase-auth",
        category: "firebase",
        name: "Authentication",
        status: "error",
        message: `Identity Toolkit respondió con estado ${response.status}.`,
      };
    }

    const data = (await response.json()) as { projectId?: string };
    const configuredProjectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const remoteProjectId = data.projectId?.trim();

    if (
      configuredProjectId &&
      remoteProjectId &&
      configuredProjectId !== remoteProjectId
    ) {
      return {
        id: "firebase-auth",
        category: "firebase",
        name: "Authentication",
        status: "warning",
        message:
          "Auth responde, pero el projectId remoto no coincide con NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
        details: [
          `Configurado: ${configuredProjectId}`,
          `Remoto: ${remoteProjectId}`,
        ],
      };
    }

    return {
      id: "firebase-auth",
      category: "firebase",
      name: "Authentication",
      status: "ok",
      message: remoteProjectId
        ? `Identity Toolkit operativo (proyecto ${remoteProjectId}).`
        : "Identity Toolkit operativo.",
    };
  } catch {
    return {
      id: "firebase-auth",
      category: "firebase",
      name: "Authentication",
      status: "error",
      message: "No se pudo contactar la API de Firebase Authentication.",
    };
  }
}

async function checkFirestoreApi(): Promise<HealthCheck> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (!projectId) {
    return {
      id: "firebase-firestore",
      category: "firebase",
      name: "Firestore",
      status: "error",
      message: "Falta NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
    };
  }

  try {
    const response = await fetchWithTimeout(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`,
    );

    if (response.status === 401 || response.status === 403) {
      return {
        id: "firebase-firestore",
        category: "firebase",
        name: "Firestore",
        status: "ok",
        message:
          "API de Firestore accesible (requiere sesión para leer datos).",
      };
    }

    if (response.ok) {
      return {
        id: "firebase-firestore",
        category: "firebase",
        name: "Firestore",
        status: "ok",
        message: "API de Firestore responde correctamente.",
      };
    }

    return {
      id: "firebase-firestore",
      category: "firebase",
      name: "Firestore",
      status: "warning",
      message: `Firestore respondió con estado ${response.status}.`,
    };
  } catch {
    return {
      id: "firebase-firestore",
      category: "firebase",
      name: "Firestore",
      status: "error",
      message: "No se pudo contactar la API de Firestore.",
    };
  }
}

function checkFirebaseStorage(): HealthCheck {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  if (!bucket) {
    return {
      id: "firebase-storage",
      category: "firebase",
      name: "Storage",
      status: "warning",
      message: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no está definido.",
    };
  }

  return {
    id: "firebase-storage",
    category: "firebase",
    name: "Storage",
    status: "ok",
    message: `Bucket configurado (${bucket}).`,
  };
}

function checkFirebaseClient(): HealthCheck {
  if (isFirebaseConfigured()) {
    return {
      id: "firebase-client",
      category: "firebase",
      name: "SDK cliente",
      status: "ok",
      message: "El SDK de Firebase puede inicializarse en el cliente.",
    };
  }

  return {
    id: "firebase-client",
    category: "firebase",
    name: "SDK cliente",
    status: "error",
    message: "Firebase no está configurado para el cliente.",
  };
}

function checkVercelRuntime(): HealthCheck {
  const onVercel = process.env.VERCEL === "1";
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.trim()?.slice(0, 7);
  const details: string[] = [];

  if (vercelEnv) {
    details.push(`Entorno: ${vercelEnv}`);
  }

  if (vercelUrl) {
    details.push(`URL de despliegue: ${vercelUrl}`);
  }

  if (commit) {
    details.push(`Commit: ${commit}`);
  }

  if (onVercel) {
    return {
      id: "vercel-runtime",
      category: "vercel",
      name: "Entorno Vercel",
      status: "ok",
      message: "La aplicación se ejecuta en Vercel.",
      details,
    };
  }

  return {
    id: "vercel-runtime",
    category: "vercel",
    name: "Entorno Vercel",
    status: "warning",
    message: "Ejecución local o fuera de Vercel (sin metadatos de despliegue).",
    details: details.length > 0 ? details : ["NODE_ENV: " + getRuntimeEnvironment()],
  };
}

function checkSiteUrl(): HealthCheck {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return {
      id: "vercel-site-url",
      category: "vercel",
      name: "URL pública del sitio",
      status: "warning",
      message:
        "NEXT_PUBLIC_SITE_URL no está definida; se usará localhost o VERCEL_URL.",
    };
  }

  return {
    id: "vercel-site-url",
    category: "vercel",
    name: "URL pública del sitio",
    status: "ok",
    message: `URL configurada: ${siteUrl}`,
  };
}

async function checkVercelBlob(): Promise<HealthCheck> {
  if (!isVercelBlobConfigured()) {
    const status =
      process.env.NODE_ENV === "production" ? "error" : "warning";

    return {
      id: "vercel-blob",
      category: "vercel",
      name: "Blob Storage",
      status,
      message:
        status === "error"
          ? "Vercel Blob no está configurado en producción."
          : "Vercel Blob no configurado; en desarrollo se usa almacenamiento local.",
      details: [
        "Defina BLOB_STORE_ID (recomendado) o BLOB_READ_WRITE_TOKEN.",
      ],
    };
  }

  try {
    await head("products.json", getBlobCommandOptions());

    return {
      id: "vercel-blob",
      category: "vercel",
      name: "Blob Storage",
      status: "ok",
      message: "Conexión con Vercel Blob operativa (products.json accesible).",
    };
  } catch (error) {
    const detail =
      error instanceof Error && error.message.trim()
        ? error.message
        : "No se pudo acceder al store.";

    return {
      id: "vercel-blob",
      category: "vercel",
      name: "Blob Storage",
      status: "error",
      message: "Variables presentes, pero Blob no responde.",
      details: [detail],
    };
  }
}

async function checkUpstashRedis(): Promise<HealthCheck> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    const status =
      process.env.NODE_ENV === "production" ? "warning" : "ok";

    return {
      id: "upstash-redis",
      category: "integraciones",
      name: "Upstash Redis (rate limit)",
      status,
      message:
        status === "warning"
          ? "Upstash no configurado; rate limiting usa memoria local por instancia."
          : "Upstash no configurado; en desarrollo se usa memoria local.",
    };
  }

  try {
    const redis = Redis.fromEnv();
    const pong = await redis.ping();

    if (pong === "PONG") {
      return {
        id: "upstash-redis",
        category: "integraciones",
        name: "Upstash Redis (rate limit)",
        status: "ok",
        message: "Redis responde correctamente (PONG).",
      };
    }

    return {
      id: "upstash-redis",
      category: "integraciones",
      name: "Upstash Redis (rate limit)",
      status: "warning",
      message: `Redis respondió: ${String(pong)}`,
    };
  } catch (error) {
    const detail =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Error desconocido";

    return {
      id: "upstash-redis",
      category: "integraciones",
      name: "Upstash Redis (rate limit)",
      status: "error",
      message: "No se pudo contactar Upstash Redis.",
      details: [detail],
    };
  }
}

async function checkRouteReachability(
  baseUrl: string,
  path: string,
  label: string,
  category: "paginas" | "api",
): Promise<HealthCheck> {
  const id = `${category}-${path.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}`;

  try {
    const response = await fetchWithTimeout(`${baseUrl}${path}`, {
      method: "GET",
      headers: { Accept: "text/html,application/json" },
    });

    if (response.ok) {
      return {
        id,
        category,
        name: label,
        status: "ok",
        message: `Responde ${response.status} en ${path}`,
      };
    }

    return {
      id,
      category,
      name: label,
      status: "error",
      message: `Respondió ${response.status} en ${path}`,
    };
  } catch {
    return {
      id,
      category,
      name: label,
      status: "error",
      message: `No responde en ${path}`,
    };
  }
}

function summarizeChecks(checks: HealthCheck[]): SystemHealthReport["summary"] {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { ok: 0, warning: 0, error: 0 },
  );
}

export async function getSystemHealthReport(): Promise<SystemHealthReport> {
  const baseUrl = getDeploymentBaseUrl();

  const firebaseChecks = await Promise.all([
    Promise.resolve(checkFirebaseEnv()),
    Promise.resolve(checkFirebaseClient()),
    checkFirebaseAuthApi(),
    checkFirestoreApi(),
    Promise.resolve(checkFirebaseStorage()),
  ]);

  const vercelChecks = await Promise.all([
    Promise.resolve(checkVercelRuntime()),
    Promise.resolve(checkSiteUrl()),
    checkVercelBlob(),
  ]);

  const integrationChecks = await Promise.all([checkUpstashRedis()]);

  const pageChecks = await Promise.all(
    PUBLIC_PAGES.map((page) =>
      checkRouteReachability(baseUrl, page.path, page.label, "paginas"),
    ),
  );

  const apiChecks = await Promise.all(
    PUBLIC_APIS.map((route) =>
      checkRouteReachability(baseUrl, route.path, route.label, "api"),
    ),
  );

  const checks = [
    ...firebaseChecks,
    ...vercelChecks,
    ...integrationChecks,
    ...pageChecks,
    ...apiChecks,
  ];

  return {
    checkedAt: new Date().toISOString(),
    environment: getRuntimeEnvironment(),
    deploymentUrl: baseUrl,
    checks,
    summary: summarizeChecks(checks),
  };
}

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  firebase: "Firebase",
  vercel: "Vercel",
  paginas: "Páginas públicas",
  api: "API pública",
  integraciones: "Otras integraciones",
};
