import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { SOLICITUDES_SOPORTE_TECNICO_COLLECTION } from "@/lib/soporte-tecnico/constants";
import { FieldValue } from "firebase-admin/firestore";

/**
 * PATCH /api/electron/solicitudes/[id]/estado
 *
 * Actualiza el campo "estado" de una solicitud (cotización o soporte técnico).
 * Protegido con el secreto compartido de la app de escritorio.
 *
 * Body: { "estado": "aprobada_ot" | "rechazada" | "en_produccion" | "terminada" | "entregada" }
 *
 * Busca el documento en ambas colecciones (cotizaciones y soporte) y actualiza
 * el estado en la que corresponda. También registra "actualizadoEn" con
 * timestamp del servidor.
 */

const COLLECTIONS = [SOLICITUDES_COTIZACION_COLLECTION, SOLICITUDES_SOPORTE_TECNICO_COLLECTION];

const ESTADOS_VALIDOS = new Set([
  "pendiente",
  "en_revision",
  "en_cotizacion",
  "aprobada_ot",
  "rechazada",
  "completada",
  "abierta",
  "en_curso",
  "en_produccion",
  "terminada",
  "entregada",
  "resuelta",
  "cerrada",
]);

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  en_cotizacion: "En cotización",
  aprobada_ot: "Aprobada (OT)",
  rechazada: "Rechazada",
  completada: "Completada",
  abierta: "Abierta",
  en_curso: "En curso",
  en_produccion: "En producción",
  terminada: "Terminada",
  entregada: "Entregada",
  resuelta: "Resuelta",
  cerrada: "Cerrada",
};

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return electronJson({ error: "ID de solicitud requerido." }, { status: 400 });
  }

  let body: Record<string, unknown> = {};

  try {
    const text = await request.text();

    if (text.trim()) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    return electronJson({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const estado = body.estado;

  if (typeof estado !== "string" || !estado.trim()) {
    return electronJson(
      { error: 'Campo "estado" requerido en el body.' },
      { status: 400 },
    );
  }

  if (!ESTADOS_VALIDOS.has(estado)) {
    return electronJson(
      { error: `Estado no válido: "${estado}". Estados permitidos: ${[...ESTADOS_VALIDOS].join(", ")}` },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let docRef: any = null;

    for (const collectionName of COLLECTIONS) {
      const ref = db.collection(collectionName).doc(id);
      const snapshot = await ref.get();

      if (snapshot.exists) {
        docRef = ref;
        break;
      }
    }

    if (!docRef) {
      return electronJson(
        { error: `Solicitud no encontrada con ID: ${id}` },
        { status: 404 },
      );
    }

    const esCotizacion = estado === "aprobada_ot" || estado === "rechazada" || estado === "completada";
    const update: Record<string, unknown> = {
      estado,
      estadoActualizadoAt: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    };

    if (esCotizacion) {
      update.cotizacionEstado = estado;
      update.cotizacionEstadoLabel = ESTADO_LABELS[estado] ?? estado;
    }

    if (estado === "aprobada_ot") {
      update.enOT = true;
      update.produccion = false;
      update.produccionEtapa = "por_iniciar";
      update.produccionEtapaLabel = "Por iniciar";
    }

    if (estado === "en_produccion") {
      update.enOT = true;
      update.produccion = true;
      update.produccionEtapa = "en_produccion";
      update.produccionEtapaLabel = "En producción";
    }

    if (estado === "terminada" || estado === "entregada") {
      update.enOT = true;
      update.produccion = true;
      update.produccionEtapa = estado;
      update.produccionEtapaLabel = ESTADO_LABELS[estado];
    }

    await docRef.update(update);

    return electronJson({ ok: true, id, estado });
  } catch (error) {
    console.error(`[electron/solicitudes/${id}/estado]`, error);

    return electronJson(
      { error: "No se pudo actualizar la solicitud." },
      { status: 500 },
    );
  }
}

async function findDoc(
  db: NonNullable<ReturnType<typeof getFirebaseAdminFirestore>>,
  id: string,
) {
  for (const collectionName of COLLECTIONS) {
    const ref = db.collection(collectionName).doc(id);
    const snapshot = await ref.get();

    if (snapshot.exists) {
      return ref;
    }
  }

  return null;
}
