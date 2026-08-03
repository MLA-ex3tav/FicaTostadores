import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { SOLICITUDES_SOPORTE_TECNICO_COLLECTION } from "@/lib/soporte-tecnico/constants";

/**
 * GET /api/electron/solicitudes?tipo=cotizaciones|soporte
 *
 * Lectura de solicitudes para la app de escritorio (Tauri). La app no tiene
 * login de Firebase y las reglas de Firestore exigen rol staff, así que la
 * lectura se hace aquí con Admin SDK y se protege con el secreto compartido
 * (Authorization: Bearer COTIZACIONES_APP_SECRET), igual que el heartbeat.
 */

const COLLECTIONS_BY_TIPO: Record<string, string> = {
  cotizaciones: SOLICITUDES_COTIZACION_COLLECTION,
  soporte: SOLICITUDES_SOPORTE_TECNICO_COLLECTION,
};

const MAX_SOLICITUDES = 100;

function serializeFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date };

    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString();
    }

    const output: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      output[key] = serializeFirestoreValue(entry);
    }

    return output;
  }

  return value;
}

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function GET(request: Request) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    const status = isElectronSecretConfigured() ? 401 : 503;

    return electronJson(
      {
        error:
          status === 401
            ? "Secreto de app inválido o ausente."
            : "COTIZACIONES_APP_SECRET no configurado en el servidor.",
      },
      { status },
    );
  }

  const tipo = new URL(request.url).searchParams.get("tipo") ?? "cotizaciones";
  const collectionName = COLLECTIONS_BY_TIPO[tipo];

  if (!collectionName) {
    return electronJson(
      { error: `Tipo inválido: ${tipo}. Use cotizaciones|soporte.` },
      { status: 400 },
    );
  }

  const db = getFirebaseAdminFirestore();

  if (!db) {
    return electronJson(
      {
        error:
          "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH.",
      },
      { status: 503 },
    );
  }

  try {
    const snapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .limit(MAX_SOLICITUDES)
      .get();

    const solicitudes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(serializeFirestoreValue(doc.data()) as Record<string, unknown>),
    }));

    return electronJson({ ok: true, tipo, count: solicitudes.length, solicitudes });
  } catch (error) {
    console.error(`[electron/solicitudes:${tipo}]`, error);

    return electronJson(
      { error: "No se pudieron leer las solicitudes." },
      { status: 500 },
    );
  }
}
