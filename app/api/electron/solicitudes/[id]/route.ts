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
 * DELETE /api/electron/solicitudes/[id]
 *
 * Elimina permanentemente una solicitud (cotización o soporte técnico) de
 * Firestore. Protegido con el secreto compartido de la app de escritorio.
 *
 * Busca el documento en ambas colecciones (cotizaciones y soporte) y lo borra
 * de la que corresponda.
 */

const COLLECTIONS = [SOLICITUDES_COTIZACION_COLLECTION, SOLICITUDES_SOPORTE_TECNICO_COLLECTION];

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function DELETE(
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

    await docRef.delete();

    return electronJson({ ok: true, id, deleted: true });
  } catch (error) {
    console.error(`[electron/solicitudes/${id}]`, error);

    return electronJson(
      { error: "No se pudo eliminar la solicitud." },
      { status: 500 },
    );
  }
}
