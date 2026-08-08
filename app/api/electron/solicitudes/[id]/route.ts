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
import {
  cleanText,
  computePricing,
  parseProductInputLines,
} from "@/lib/electron-solicitud-input";

/**
 * PATCH /api/electron/solicitudes/[id]
 *
 * Edita una cotización existente en el MISMO documento (no crea una copia).
 * Resuelve el documento por su ID de documento o por el campo `id` normalizado,
 * actualiza únicamente los campos enviados y conserva `createdAt` / `source`.
 *
 * DELETE /api/electron/solicitudes/[id]
 *
 * Elimina permanentemente una solicitud (cotización o soporte técnico) de
 * Firestore. Protegido con el secreto compartido de la app de escritorio.
 *
 * Busca el documento en ambas colecciones (cotizaciones y soporte) y lo borra
 * de la que corresponda.
 */

const COLLECTIONS = [SOLICITUDES_COTIZACION_COLLECTION, SOLICITUDES_SOPORTE_TECNICO_COLLECTION];

function unauthorizedOrUnavailable(): Response {
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

function missingDb(): Response {
  return electronJson(
    {
      error:
        "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH.",
    },
    { status: 503 },
  );
}

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    return unauthorizedOrUnavailable();
  }

  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return electronJson({ error: "ID de solicitud requerido." }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();

  if (!db) {
    return missingDb();
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

  try {
    const collection = db.collection(SOLICITUDES_COTIZACION_COLLECTION);
    let docRef;

    const byDocId = await collection.doc(id).get();

    if (byDocId.exists) {
      docRef = byDocId.ref;
    } else {
      const byIdField = await collection.where("id", "==", id).limit(1).get();

      if (!byIdField.empty) {
        docRef = byIdField.docs[0].ref;
      }
    }

    if (!docRef) {
      return electronJson(
        { error: `Solicitud no encontrada con ID: ${id}` },
        { status: 404 },
      );
    }

    const update: Record<string, unknown> = {
      id: docRef.id,
      actualizadoEn: FieldValue.serverTimestamp(),
    };

    if (body.clientName !== undefined && body.clientName !== null) {
      update.clientName = cleanText(body.clientName, 120);
    }

    if (body.clientPhone !== undefined) {
      update.clientPhone = cleanText(body.clientPhone, 32) || null;
    }

    if (body.clientRut !== undefined) {
      update.clientRut = cleanText(body.clientRut, 24) || null;
    }

    if (body.clientEmail !== undefined) {
      update.clientEmail = cleanText(body.clientEmail, 200) || null;
    }

    if (body.clientComuna !== undefined) {
      update.clientComuna = cleanText(body.clientComuna, 100) || null;
    }

    if (body.clientAddress !== undefined) {
      update.clientAddress = cleanText(body.clientAddress, 240) || null;
    }

    if (body.message !== undefined) {
      update.message = cleanText(body.message, 1000) || null;
    }

    if (body.shipping !== undefined) {
      update.shipping =
        body.shipping && typeof body.shipping === "object" ? body.shipping : null;
    }

    if (body.products !== undefined) {
      const products = parseProductInputLines(body.products);

      if (products.length > 0) {
        update.products = products.map((line) => ({
          productId: line.productId || null,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.unitPrice * line.quantity,
          catalog: "movil",
        }));
        const pricing = computePricing(products);

        update.pricing = pricing;
        update.subtotal = pricing.subtotal;
      }
    }

    if (typeof body.enOT === "boolean") {
      update.enOT = body.enOT;
      update.aprobadaAt = body.enOT ? FieldValue.serverTimestamp() : null;
    }

    if (body.estado !== undefined && body.estado !== null && body.estado !== "") {
      const estado = cleanText(body.estado, 40);

      if (estado) {
        update.estado = estado;
        update.cotizacionEstado = estado;
        update.cotizacionEstadoLabel =
          estado === "aprobada_ot"
            ? "Aprobada (OT)"
            : estado === "aprobada"
              ? "Aprobada"
              : estado === "rechazada"
                ? "Rechazada"
                : estado === "entregada"
                  ? "Entregada"
                  : "Pendiente";
      }
    }

    await docRef.set(update, { merge: true });

    const dupeQuery = await collection.where("id", "==", docRef.id).get();

    for (const dupeDoc of dupeQuery.docs) {
      if (dupeDoc.id !== docRef.id) {
        await dupeDoc.ref.delete().catch(() => {});
      }
    }

    return electronJson({ ok: true, id: docRef.id });
  } catch (error) {
    console.error(`[electron/solicitudes/${id}]`, error);

    return electronJson(
      { error: "No se pudo actualizar la solicitud." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    return unauthorizedOrUnavailable();
  }

  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return electronJson({ error: "ID de solicitud requerido." }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();

  if (!db) {
    return missingDb();
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