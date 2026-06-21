import { FieldValue } from "firebase-admin/firestore";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { enrichCotizacionProducts } from "@/lib/quote-pricing";
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
  const pricing = enrichCotizacionProducts(input.products, catalog);

  await docRef.set({
    source: "web",
    clientName: input.name,
    clientPhone: input.phone,
    clientEmail: input.email,
    clientCountry: input.clientCountry,
    message: input.message,
    shipping: input.shipping,
    clientUserId: input.clientUserId,
    products: pricing.products,
    finalTotal: pricing.finalTotal,
    pricingComplete: pricing.pricingComplete,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id };
}
