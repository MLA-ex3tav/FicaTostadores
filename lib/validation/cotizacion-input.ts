import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { sanitizeSlug, sanitizeText } from "@/lib/sanitize";
import type {
  CotizacionProductAddOn,
  CotizacionProductLine,
} from "@/lib/cotizaciones/types";
import { parseClpPriceInput } from "@/lib/pricing";
import { sanitizeShippingInfo, type ShippingInfo } from "@/lib/shipping-profile";

export interface CreateSolicitudCotizacionInput {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  products: CotizacionProductLine[];
  clientCountry: string | null;
  shipping: ShippingInfo | null;
  clientUserId: string | null;
}

function sanitizeAddOn(value: unknown): CotizacionProductAddOn | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = sanitizeSlug(record.id, 80);
  const name = sanitizeText(record.name, 200, { required: true });

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    price: parseClpPriceInput(record.price),
  };
}

function sanitizeProductLine(value: unknown): CotizacionProductLine | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = sanitizeText(record.name, 200, { required: true });
  const capacity = sanitizeText(record.capacity, 100, { required: true });

  if (!name || !capacity) {
    return null;
  }

  const productId = record.id ? sanitizeSlug(record.id, 80) : null;
  const catalog = record.catalog
    ? sanitizeText(record.catalog, 80, { required: true })
    : null;

  const selectedAddOns = Array.isArray(record.selectedAddOns)
    ? record.selectedAddOns
        .map(sanitizeAddOn)
        .filter((addOn): addOn is CotizacionProductAddOn => addOn !== null)
        .slice(0, 20)
    : [];

  return {
    productId,
    name,
    capacity,
    catalog,
    listPrice: null,
    selectedAddOns,
    lineTotal: null,
  };
}

export function parseCreateSolicitudCotizacionInput(
  body: unknown,
): CreateSolicitudCotizacionInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const name = sanitizeText(record.name, 120, { required: true });
  const phoneRaw = sanitizeText(record.phone, 32, { required: true });
  const message = sanitizeText(record.message, 1000) || null;
  const emailRaw = sanitizeText(record.email, 200) || null;

  if (!name || !phoneRaw) {
    return null;
  }

  const parsedPhone = parsePhoneNumber(phoneRaw);

  if (!parsedPhone || !isValidPhoneNumber(phoneRaw)) {
    return null;
  }

  const email =
    emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : null;

  const products = Array.isArray(record.products)
    ? record.products
        .map(sanitizeProductLine)
        .filter((product): product is CotizacionProductLine => product !== null)
        .slice(0, 10)
    : [];

  const countryCode = parsedPhone.country ?? null;
  const clientCountry = countryCode;
  const shipping = sanitizeShippingInfo(record.shipping);
  const clientUserIdRaw = sanitizeText(record.clientUserId, 128);
  const clientUserId =
    clientUserIdRaw && /^[a-zA-Z0-9]{10,128}$/.test(clientUserIdRaw)
      ? clientUserIdRaw
      : null;

  return {
    name,
    phone: parsedPhone.format("E.164"),
    email,
    message,
    products,
    clientCountry,
    shipping,
    clientUserId,
  };
}
