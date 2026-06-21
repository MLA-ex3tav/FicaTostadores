import { FieldValue } from "firebase-admin/firestore";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import type { CreateSolicitudCotizacionInput } from "@/lib/validation/cotizacion-input";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";

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

  await docRef.set({
    source: "web",
    clientName: input.name,
    clientPhone: input.phone,
    clientEmail: input.email,
    clientCountry: input.clientCountry,
    message: input.message,
    products: input.products,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id };
}
