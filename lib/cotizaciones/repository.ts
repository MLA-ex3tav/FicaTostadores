import { FieldValue } from "firebase-admin/firestore";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { serializeClientSolicitudCotizacion } from "@/lib/cotizaciones/serialize-client-solicitud";
import type { ClientSolicitudCotizacion } from "@/lib/cotizaciones/types";
import { enrichCotizacionProducts } from "@/lib/quote-product";
import type { CreateSolicitudCotizacionInput } from "@/lib/validation/cotizacion-input";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { getProducts } from "@/lib/products-server";

export class CotizacionesRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CotizacionesRepositoryError";
  }
}

export async function createSolicitudCotizacion(
  input: CreateSolicitudCotizacionInput,
): Promise<{ id: string }> {
  const db = getFirebaseAdminFirestore();

  if (!db) {
    throw new CotizacionesRepositoryError(
      "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local.",
    );
  }

  const docRef = db.collection(SOLICITUDES_COTIZACION_COLLECTION).doc();
  const catalog = await getProducts();
  const products = enrichCotizacionProducts(input.products, catalog);

  await docRef.set({
    source: "web",
    clientName: input.name,
    clientPhone: input.phone,
    clientEmail: input.email,
    clientCountry: input.clientCountry,
    message: input.message,
    shipping: input.shipping,
    clientUserId: input.clientUserId,
    products,
    estado: "en_revision",
    cotizacionEstado: "en_revision",
    cotizacionEstadoLabel: "En revisión",
    createdAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function listSolicitudesByClientUserId(
  clientUserId: string,
): Promise<ClientSolicitudCotizacion[]> {
  const db = getFirebaseAdminFirestore();

  if (!db) {
    throw new CotizacionesRepositoryError(
      "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local.",
    );
  }

  const snapshot = await db
    .collection(SOLICITUDES_COTIZACION_COLLECTION)
    .where("clientUserId", "==", clientUserId)
    .limit(100)
    .get();

  const solicitudes = snapshot.docs.map((doc) =>
    serializeClientSolicitudCotizacion(doc.id, doc.data() as Record<string, unknown>),
  );

  solicitudes.sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightTime - leftTime;
  });

  return solicitudes;
}
