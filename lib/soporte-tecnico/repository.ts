import { FieldValue } from "firebase-admin/firestore";
import { SOLICITUDES_SOPORTE_TECNICO_COLLECTION } from "@/lib/soporte-tecnico/constants";
import type { TechnicalIssueCategoryId } from "@/lib/soporte-tecnico/issue-categories";
import type { CreateSolicitudSoporteTecnicoInput } from "@/lib/validation/soporte-tecnico-input";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";

export class SoporteTecnicoRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SoporteTecnicoRepositoryError";
  }
}

export async function createSolicitudSoporteTecnico(
  input: CreateSolicitudSoporteTecnicoInput,
): Promise<{ id: string }> {
  const db = getFirebaseAdminFirestore();

  if (!db) {
    throw new SoporteTecnicoRepositoryError(
      "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local.",
    );
  }

  const docRef = db.collection(SOLICITUDES_SOPORTE_TECNICO_COLLECTION).doc();

  await docRef.set({
    source: "web",
    clientName: input.name,
    clientPhone: input.phone,
    clientEmail: input.email,
    clientCountry: input.clientCountry,
    clientUserId: input.clientUserId,
    equipmentModel: input.equipmentModel,
    productId: input.productId,
    issueCategory: input.issueCategory as TechnicalIssueCategoryId,
    issueDescription: input.issueDescription,
    equipmentLocation: input.equipmentLocation,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { id: docRef.id };
}
