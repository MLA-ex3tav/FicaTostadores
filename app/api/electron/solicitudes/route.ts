import { FieldValue } from "firebase-admin/firestore";
import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { SOLICITUDES_SOPORTE_TECNICO_COLLECTION } from "@/lib/soporte-tecnico/constants";
import {
  cleanText,
  computePricing,
  parseProductInputLines,
} from "@/lib/electron-solicitud-input";

/**
 * GET /api/electron/solicitudes?tipo=cotizaciones|soporte
 *
 * Lectura de solicitudes para la app de escritorio (Tauri). La app no tiene
 * login de Firebase y las reglas de Firestore exigen rol staff, así que la
 * lectura se hace aquí con Admin SDK y se protege con el secreto compartido
 * (Authorization: Bearer COTIZACIONES_APP_SECRET), igual que el heartbeat.
 *
 * POST /api/electron/solicitudes
 *
 * Registra una orden de trabajo (OT) creada desde la app móvil. El documento
 * queda en solicitudes_cotizacion con estado "aprobada_ot" y enOT: true, para
 * que aparezca directamente en la pestaña Órdenes de Trabajo de la app de
 * escritorio y del admin web.
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

    const seen = new Map<string, Record<string, unknown>>();

    snapshot.docs.forEach((doc) => {
      const data = (serializeFirestoreValue(doc.data()) as Record<string, unknown>) ?? {};
      const canonicalId = doc.id;
      const codeKey = String(data.id ?? canonicalId).trim();
      const dedupeKey = codeKey || canonicalId;

      const existing = seen.get(dedupeKey);
      const item = { ...data, id: canonicalId };

      if (!existing || canonicalId === codeKey) {
        seen.set(dedupeKey, item);
      }
    });

    const solicitudes = Array.from(seen.values());

    return electronJson({ ok: true, tipo, count: solicitudes.length, solicitudes });
  } catch (error) {
    console.error(`[electron/solicitudes:${tipo}]`, error);

    return electronJson(
      { error: "No se pudieron leer las solicitudes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

  let body: Record<string, unknown> = {};

  try {
    const text = await request.text();

    if (text.trim()) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    return electronJson({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const clientName = cleanText(body.clientName, 120);
  const clientPhone = cleanText(body.clientPhone, 32);
  const products = parseProductInputLines(body.products);

  if (!clientName) {
    return electronJson(
      { error: 'Campo "clientName" requerido.' },
      { status: 400 },
    );
  }

  if (products.length === 0) {
    return electronJson(
      { error: 'Campo "products" requerido con al menos un producto.' },
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

  const pricing = computePricing(products);
  const subtotal = pricing.subtotal;

  try {
    const customId = cleanText(body.id, 100);
    const collection = db.collection(SOLICITUDES_COTIZACION_COLLECTION);

    let docRef;
    let isUpdate = false;

    if (customId) {
      const byDocId = await collection.doc(customId).get();

      if (byDocId.exists) {
        docRef = byDocId.ref;
        isUpdate = true;
      } else {
        const byIdField = await collection.where("id", "==", customId).limit(1).get();

        if (!byIdField.empty) {
          docRef = byIdField.docs[0].ref;
          isUpdate = true;
        } else {
          docRef = collection.doc(customId);
        }
      }
    } else {
      docRef = collection.doc();
    }

    const now = FieldValue.serverTimestamp();

    const productsData = products.map((line) => ({
      productId: line.productId || null,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.unitPrice * line.quantity,
      catalog: "movil",
    }));

    const requestedEstado = cleanText(body.estado, 40);
    const estado = requestedEstado || "pendiente";
    const enOT = typeof body.enOT === "boolean"
      ? body.enOT
      : estado === "aprobada_ot";

    await docRef.set(
      {
        id: docRef.id,
        ...(isUpdate ? {} : { source: "movil" }),
        clientName,
        clientPhone: clientPhone || null,
        clientRut: cleanText(body.clientRut, 24) || null,
        clientEmail: cleanText(body.clientEmail, 200) || null,
        clientComuna: cleanText(body.clientComuna, 100) || null,
        clientAddress: cleanText(body.clientAddress, 240) || null,
        message: cleanText(body.message, 1000) || null,
        shipping: body.shipping && typeof body.shipping === "object" ? body.shipping : null,
        products: productsData,
        pricing,
        subtotal,
        estado,
        cotizacionEstado: estado,
        cotizacionEstadoLabel: estado === "aprobada_ot" ? "Aprobada (OT)" : "Pendiente",
        enOT,
        actualizadoEn: now,
        ...(isUpdate
          ? {}
          : {
              createdAt: now,
              produccion: false,
              produccionEtapa: "por_iniciar",
              produccionEtapaLabel: "Por iniciar",
              aprobadaAt: enOT ? now : null,
            }),
      },
      { merge: true },
    );

    if (customId && isUpdate) {
      const oldQuery = await collection.where("id", "==", customId).get();

      for (const oldDoc of oldQuery.docs) {
        if (oldDoc.id !== docRef.id) {
          await oldDoc.ref.delete().catch(() => {});
        }
      }
    }

    return electronJson(
      { ok: true, id: docRef.id, estado },
      { status: 201 },
    );
  } catch (error) {
    console.error("[electron/solicitudes POST]", error);

    return electronJson(
      { error: "No se pudo registrar la orden de trabajo." },
      { status: 500 },
    );
  }
}
