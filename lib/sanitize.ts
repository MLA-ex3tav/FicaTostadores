const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}

export function sanitizeText(
  value: unknown,
  maxLength: number,
  { required = false }: { required?: boolean } = {},
): string | null {
  if (value === null || value === undefined) {
    return required ? null : "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = stripControlChars(value).trim();

  if (required && !cleaned) {
    return null;
  }

  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength);
  }

  return cleaned;
}

export function sanitizeSlug(
  value: unknown,
  maxLength = 80,
): string | null {
  const text = sanitizeText(value, maxLength, { required: true });

  if (!text || !SLUG_PATTERN.test(text)) {
    return null;
  }

  return text;
}

export function sanitizeStringArray(
  value: unknown,
  maxItems: number,
  maxItemLength: number,
): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length > maxItems) {
    return null;
  }

  const items: string[] = [];

  for (const item of value) {
    const cleaned = sanitizeText(item, maxItemLength, { required: true });

    if (!cleaned) {
      return null;
    }

    items.push(cleaned);
  }

  return items;
}

const ALLOWED_IMAGE_HOSTS = [
  "public.blob.vercel-storage.com",
];

export function sanitizeImageUrl(value: unknown): string | null {
  const text = sanitizeText(value, 2048, { required: true });

  if (!text) {
    return null;
  }

  if (text.startsWith("/uploads/products/")) {
    if (!/^\/uploads\/products\/[a-z0-9-]+\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(text)) {
      return null;
    }

    return text;
  }

  try {
    const url = new URL(text);

    if (url.protocol !== "https:") {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const isAllowedHost = ALLOWED_IMAGE_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
    );

    if (!isAllowedHost) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeImageUrlArray(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 20) {
    return [];
  }

  const urls: string[] = [];

  for (const item of value) {
    const url = sanitizeImageUrl(item);

    if (url) {
      urls.push(url);
    }
  }

  return urls;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
