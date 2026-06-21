import { sanitizeText } from "@/lib/sanitize";

export interface ShippingInfo {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface ClienteShippingProfile extends ShippingInfo {
  contactName: string | null;
  phone: string | null;
  email: string | null;
}

export const EMPTY_SHIPPING_INFO: ShippingInfo = {
  addressLine1: null,
  addressLine2: null,
  city: null,
  region: null,
  postalCode: null,
  country: null,
};

export function sanitizeShippingField(
  value: unknown,
  maxLength: number,
): string | null {
  const cleaned = sanitizeText(value, maxLength);

  return cleaned ? cleaned : null;
}

export function sanitizeShippingInfo(value: unknown): ShippingInfo | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const shipping: ShippingInfo = {
    addressLine1: sanitizeShippingField(record.addressLine1, 200),
    addressLine2: sanitizeShippingField(record.addressLine2, 120),
    city: sanitizeShippingField(record.city, 80),
    region: sanitizeShippingField(record.region, 80),
    postalCode: sanitizeShippingField(record.postalCode, 20),
    country: sanitizeShippingField(record.country, 80) ?? "Chile",
  };

  return hasShippingInfo(shipping) ? shipping : null;
}

export function hasShippingInfo(shipping: ShippingInfo): boolean {
  return Boolean(
    shipping.addressLine1 ||
      shipping.addressLine2 ||
      shipping.city ||
      shipping.region ||
      shipping.postalCode ||
      (shipping.country && shipping.country !== "Chile"),
  );
}

export function sanitizeClienteShippingProfile(
  value: unknown,
): ClienteShippingProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const shipping = sanitizeShippingInfo(record) ?? { ...EMPTY_SHIPPING_INFO, country: "Chile" };

  return {
    contactName: sanitizeShippingField(record.contactName, 120),
    phone: sanitizeShippingField(record.phone, 32),
    email: sanitizeShippingField(record.email, 200),
    ...shipping,
  };
}

export function readClienteShippingProfile(
  data: Record<string, unknown> | undefined,
): ClienteShippingProfile | null {
  if (!data?.shippingProfile || typeof data.shippingProfile !== "object") {
    return null;
  }

  return sanitizeClienteShippingProfile(data.shippingProfile);
}
