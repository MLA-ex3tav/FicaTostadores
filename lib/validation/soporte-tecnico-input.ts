import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { isTechnicalIssueCategoryId } from "@/lib/soporte-tecnico/issue-categories";
import { sanitizeSlug, sanitizeText } from "@/lib/sanitize";

export interface CreateSolicitudSoporteTecnicoInput {
  name: string;
  phone: string;
  email: string | null;
  equipmentModel: string;
  productId: string | null;
  issueCategory: string;
  issueDescription: string;
  equipmentLocation: string | null;
  clientUserId: string | null;
  clientCountry: string | null;
}

export function parseCreateSolicitudSoporteTecnicoInput(
  body: unknown,
): CreateSolicitudSoporteTecnicoInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const name = sanitizeText(record.name, 120, { required: true });
  const phoneRaw = sanitizeText(record.phone, 32, { required: true });
  const equipmentModel = sanitizeText(record.equipmentModel, 200, {
    required: true,
  });
  const issueDescription = sanitizeText(record.issueDescription, 2000, {
    required: true,
  });
  const equipmentLocation = sanitizeText(record.equipmentLocation, 300) || null;
  const emailRaw = sanitizeText(record.email, 200) || null;
  const issueCategoryRaw = sanitizeText(record.issueCategory, 40, {
    required: true,
  });
  const productId = record.productId
    ? sanitizeSlug(record.productId, 80)
    : null;

  if (
    !name ||
    !phoneRaw ||
    !equipmentModel ||
    !issueDescription ||
    !issueCategoryRaw ||
    !isTechnicalIssueCategoryId(issueCategoryRaw)
  ) {
    return null;
  }

  const parsedPhone = parsePhoneNumber(phoneRaw);

  if (!parsedPhone || !isValidPhoneNumber(phoneRaw)) {
    return null;
  }

  const email =
    emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : null;

  const clientUserIdRaw = sanitizeText(record.clientUserId, 128);
  const clientUserId =
    clientUserIdRaw && /^[a-zA-Z0-9]{10,128}$/.test(clientUserIdRaw)
      ? clientUserIdRaw
      : null;

  return {
    name,
    phone: parsedPhone.format("E.164"),
    email,
    equipmentModel,
    productId,
    issueCategory: issueCategoryRaw,
    issueDescription,
    equipmentLocation,
    clientUserId,
    clientCountry: parsedPhone.country ?? null,
  };
}
