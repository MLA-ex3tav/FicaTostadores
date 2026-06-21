import { head } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { getElectronPresenceStatus } from "@/lib/electron-presence";
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

/** URL usada por las comprobaciones HTTP (mismo despliegue en Vercel). */
function getHealthCheckBaseUrl(): string {
  if (process.env.VERCEL === "1") {
    const vercelUrl = process.env.VERCEL_URL?.trim();

    if (vercelUrl) {
      return `https://${vercelUrl.replace(/\/$/, "")}`;
    }
  }

  return getDeploymentBaseUrl();
}

function getHealthCheckFetchHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/html,application/json",
    ...extra,
  };

  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

  if (bypass) {
    headers["x-vercel-protection-bypass"] = bypass;
    headers["x-vercel-set-bypass-cookie"] = "true";
  }

  return headers;
}

function deploymentProtectionMessage(path: string): string {
  return `401 en ${path}: capa de Vercel Deployment Protection (no es el login de Firebase). Desactive la protección en producción si el sitio debe ser visitable sin contraseña de Vercel, o configure VERCEL_AUTOMATION_BYPASS_SECRET. Los roles cliente/admin se controlan aparte en Firestore.`;
}

function evaluateHttpHealthResponse(
  response: Response,
  path: string,
  okStatuses: number[] = [],
): Pick<HealthCheck, "status" | "message"> {
  if (response.ok || okStatuses.includes(response.status)) {
    return {
      status: "ok",
      message: `Responde ${response.status} en ${path}`,
    };
  }

  if (
    response.status === 401 &&
    !process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()
  ) {
    return {
      status: "warning",
      message: deploymentProtectionMessage(path),
    };
  }

  return {
    status: "error",
    message: `Respondió ${response.status} en ${path}`,
  };
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

function checkFirebaseAdmin(): HealthCheck {
  if (isFirebaseAdminConfigured()) {
    return {
      id: "firebase-admin",
      category: "firebase",
      name: "Firebase Admin",
      status: "ok",
      message:
        "Cuenta de servicio configurada para registrar solicitudes de cotización.",
    };
  }

  return {
    id: "firebase-admin",
    category: "firebase",
    name: "Firebase Admin",
    status: "error",
    message:
      "Falta Firebase Admin; el formulario web no puede guardar solicitudes.",
    details: [
      "FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH",
    ],
  };
}

async function checkCotizacionesApiRoute(baseUrl: string): Promise<HealthCheck> {
  try {
    const response = await fetchWithTimeout(
      `${baseUrl}/api/cotizaciones/solicitudes`,
      {
        method: "GET",
        headers: getHealthCheckFetchHeaders(),
      },
    );

    const evaluated = evaluateHttpHealthResponse(response, "/api/cotizaciones/solicitudes", [
      405,
      400,
    ]);

    if (evaluated.status === "ok") {
      return {
        id: "cotizaciones-api",
        category: "api",
        name: "API de solicitudes",
        status: "ok",
        message: "Endpoint POST /api/cotizaciones/solicitudes disponible.",
      };
    }

    return {
      id: "cotizaciones-api",
      category: "api",
      name: "API de solicitudes",
      status: evaluated.status,
      message: evaluated.message,
    };
  } catch {
    return {
      id: "cotizaciones-api",
      category: "api",
      name: "API de solicitudes",
      status: "error",
      message: "No responde /api/cotizaciones/solicitudes.",
    };
  }
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

function checkVercelDeploymentProtection(): HealthCheck {
  const onVercel = process.env.VERCEL === "1";
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

  if (!onVercel) {
    return {
      id: "vercel-deployment-protection",
      category: "vercel",
      name: "Protección de despliegue",
      status: "ok",
      message: "No aplica fuera de Vercel.",
    };
  }

  if (bypass) {
    return {
      id: "vercel-deployment-protection",
      category: "vercel",
      name: "Protección de despliegue",
      status: "ok",
      message:
        "Bypass de automatización configurado (VERCEL_AUTOMATION_BYPASS_SECRET).",
    };
  }

  return {
    id: "vercel-deployment-protection",
    category: "vercel",
    name: "Protección de despliegue",
    status: "warning",
    message:
      "Deployment Protection de Vercel activa: responde 401 antes del login de Firebase. No confundir con roles cliente/admin en Firestore.",
    details: [
      "Vercel → Deployment Protection → Production: None (visitantes sin contraseña Vercel)",
      "Firebase: clientes (rol cliente) vs panel admin (editor/admin) en colección clientes",
    ],
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

function formatRelativeSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  if (remainder === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainder} s`;
}

function formatPresenceTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(iso));
}

async function checkElectronCotizacionesApp(): Promise<HealthCheck> {
  const presence = await getElectronPresenceStatus();
  const details: string[] = [
    `Umbral de desconexión: ${presence.heartbeatTimeoutSec} s sin heartbeat`,
    `Almacenamiento: ${presence.storage === "redis" ? "Upstash Redis" : "memoria local (por instancia)"}`,
  ];

  if (!presence.secretConfigured) {
    details.unshift(
      "Defina COTIZACIONES_APP_SECRET (o ELECTRON_APP_SECRET) para aceptar heartbeats en producción.",
    );

    return {
      id: "electron-cotizaciones-app",
      category: "integraciones",
      name: "App de cotizaciones (Electron)",
      status: "warning",
      message:
        "Secreto de app no configurado; el endpoint de heartbeat no está protegido en desarrollo.",
      details,
    };
  }

  if (presence.connected && presence.lastSeenAt) {
    if (presence.version) {
      details.unshift(`Versión: ${presence.version}`);
    }

    if (presence.instanceId) {
      details.unshift(`Instancia: ${presence.instanceId}`);
    }

    if (presence.hostname) {
      details.unshift(`Equipo: ${presence.hostname}`);
    }

    details.unshift(
      `Última señal: ${formatPresenceTimestamp(presence.lastSeenAt)}`,
    );

    if (presence.secondsSinceLastSeen !== null) {
      details.unshift(
        `Hace ${formatRelativeSeconds(presence.secondsSinceLastSeen)}`,
      );
    }

    return {
      id: "electron-cotizaciones-app",
      category: "integraciones",
      name: "App de cotizaciones (Electron)",
      status: "ok",
      message: "Conectada y enviando heartbeat.",
      details,
    };
  }

  if (presence.lastSeenAt) {
    details.unshift(
      `Última señal: ${formatPresenceTimestamp(presence.lastSeenAt)}`,
    );

    if (presence.secondsSinceLastSeen !== null) {
      details.unshift(
        `Sin señal hace ${formatRelativeSeconds(presence.secondsSinceLastSeen)}`,
      );
    }

    if (presence.version) {
      details.unshift(`Última versión reportada: ${presence.version}`);
    }

    return {
      id: "electron-cotizaciones-app",
      category: "integraciones",
      name: "App de cotizaciones (Electron)",
      status: "error",
      message: "Desconectada (sin heartbeat reciente).",
      details,
    };
  }

  return {
    id: "electron-cotizaciones-app",
    category: "integraciones",
    name: "App de cotizaciones (Electron)",
    status: "error",
    message: "Desconectada (nunca se registró un heartbeat).",
    details,
  };
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
      headers: getHealthCheckFetchHeaders(),
    });

    const evaluated = evaluateHttpHealthResponse(response, path);

    return {
      id,
      category,
      name: label,
      status: evaluated.status,
      message: evaluated.message,
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

function isDeploymentProtection401(check: HealthCheck): boolean {
  return check.message.includes("401");
}

/** Evita filas rojas duplicadas cuando Vercel bloquea las sondas HTTP del panel. */
function consolidateHttpRouteChecks(
  checks: HealthCheck[],
  probedBaseUrl: string,
): HealthCheck[] {
  const httpChecks = checks.filter(
    (check) => check.category === "paginas" || check.category === "api",
  );

  if (httpChecks.length === 0) {
    return checks;
  }

  const allBlockedBy401 = httpChecks.every(isDeploymentProtection401);

  if (!allBlockedBy401) {
    return checks;
  }

  const otherChecks = checks.filter(
    (check) => check.category !== "paginas" && check.category !== "api",
  );

  return [
    ...otherChecks,
    {
      id: "http-routes-deployment-protection",
      category: "paginas",
      name: "Páginas y APIs públicas",
      status: "warning",
      message:
        "Las comprobaciones automáticas recibieron 401 (protección de Vercel). El sitio no exige login; esto no indica un fallo real para visitantes.",
      details: [
        `URL sondada: ${probedBaseUrl}`,
        "Antes no veía esto porque el panel Conexiones es nuevo.",
        "Opcional: Protection Bypass for Automation en Vercel para sondas verdes.",
      ],
    },
  ];
}

export async function getSystemHealthReport(): Promise<SystemHealthReport> {
  const baseUrl = getHealthCheckBaseUrl();
  const publicSiteUrl = getDeploymentBaseUrl();

  const firebaseChecks = await Promise.all([
    Promise.resolve(checkFirebaseEnv()),
    Promise.resolve(checkFirebaseClient()),
    Promise.resolve(checkFirebaseAdmin()),
    checkFirebaseAuthApi(),
    checkFirestoreApi(),
    Promise.resolve(checkFirebaseStorage()),
  ]);

  const vercelChecks = await Promise.all([
    Promise.resolve(checkVercelRuntime()),
    Promise.resolve(checkVercelDeploymentProtection()),
    Promise.resolve(checkSiteUrl()),
    checkVercelBlob(),
  ]);

  const integrationChecks = await Promise.all([
    checkElectronCotizacionesApp(),
    checkUpstashRedis(),
  ]);

  const pageChecks = await Promise.all(
    PUBLIC_PAGES.map((page) =>
      checkRouteReachability(baseUrl, page.path, page.label, "paginas"),
    ),
  );

  const apiChecks = await Promise.all([
    ...PUBLIC_APIS.map((route) =>
      checkRouteReachability(baseUrl, route.path, route.label, "api"),
    ),
    checkCotizacionesApiRoute(baseUrl),
  ]);

  const checks = consolidateHttpRouteChecks(
    [
      ...firebaseChecks,
      ...vercelChecks,
      ...integrationChecks,
      ...pageChecks,
      ...apiChecks,
    ],
    baseUrl,
  );

  return {
    checkedAt: new Date().toISOString(),
    environment: getRuntimeEnvironment(),
    deploymentUrl: publicSiteUrl,
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
