import type { Timestamp } from "firebase-admin/firestore";
import type { TechnicalIssueCategoryId } from "@/lib/soporte-tecnico/issue-categories";

export interface WebSolicitudSoporteTecnicoRecord {
  source: "web";
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  clientCountry: string | null;
  clientUserId: string | null;
  equipmentModel: string;
  productId: string | null;
  issueCategory: TechnicalIssueCategoryId;
  issueDescription: string;
  equipmentLocation: string | null;
  createdAt: Timestamp;
}
