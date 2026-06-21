/**
 * Vercel Blob auth: legacy BLOB_READ_WRITE_TOKEN or OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN).
 * @see https://vercel.com/docs/vercel-blob/using-blob-sdk
 */

interface BlobCommandOptions {
  token?: string;
  oidcToken?: string;
  storeId?: string;
}

function stripEnvQuotes(value: string | undefined): string {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function isVercelBlobConfigured(): boolean {
  return Boolean(
    stripEnvQuotes(process.env.BLOB_READ_WRITE_TOKEN) ||
      stripEnvQuotes(process.env.BLOB_STORE_ID) ||
      stripEnvQuotes(process.env.VERCEL_OIDC_TOKEN),
  );
}

export function canPersistWithBlob(): boolean {
  return isVercelBlobConfigured() || process.env.NODE_ENV !== "production";
}

export function getBlobCommandOptions(): BlobCommandOptions {
  const token = stripEnvQuotes(process.env.BLOB_READ_WRITE_TOKEN);
  const oidcToken = stripEnvQuotes(process.env.VERCEL_OIDC_TOKEN);
  const storeId = stripEnvQuotes(process.env.BLOB_STORE_ID);

  if (token) {
    return { token };
  }

  if (oidcToken && storeId) {
    return { oidcToken, storeId };
  }

  if (storeId) {
    return { storeId };
  }

  return {};
}

export function getBlobErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo acceder a Vercel Blob.";
}

export const BLOB_NOT_CONFIGURED_MESSAGE =
  "En producción conecte Vercel Blob Storage al proyecto (Storage → Blob → Connect to Project) y redeploy.";

/** Hostname for this project's public Blob store, e.g. abc123.public.blob.vercel-storage.com */
export function getBlobStoreHostname(): string | null {
  const storeId = stripEnvQuotes(process.env.BLOB_STORE_ID);
  if (storeId.startsWith("store_")) {
    return `${storeId.slice("store_".length).toLowerCase()}.public.blob.vercel-storage.com`;
  }

  const token = stripEnvQuotes(process.env.BLOB_READ_WRITE_TOKEN);
  const tokenMatch = token.match(/^vercel_blob_rw_([^_]+)_/i);
  if (tokenMatch?.[1]) {
    return `${tokenMatch[1].toLowerCase()}.public.blob.vercel-storage.com`;
  }

  return null;
}

export function isBlobStorageImageUrl(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return false;
  }

  try {
    const { hostname } = new URL(src);
    return hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return src.includes(".public.blob.vercel-storage.com");
  }
}

const LOCAL_PRODUCT_UPLOAD_PREFIX = "/uploads/products/";

const LOCAL_PRODUCT_UPLOAD_FILENAME =
  /^[a-z0-9-]+\.(jpe?g|png|gif|webp|heic|heif|avif)$/i;

export function isLocalProductUploadPath(src: string): boolean {
  if (!src.startsWith(LOCAL_PRODUCT_UPLOAD_PREFIX)) {
    return false;
  }

  const filename = src.slice(LOCAL_PRODUCT_UPLOAD_PREFIX.length);
  return LOCAL_PRODUCT_UPLOAD_FILENAME.test(filename);
}

/** Convierte rutas locales del admin a URLs públicas de Blob cuando el store está configurado. */
export function resolveStorageImageUrl(src: string): string {
  const trimmed = src.trim();

  if (!isLocalProductUploadPath(trimmed)) {
    return trimmed;
  }

  const hostname = getBlobStoreHostname();
  if (!hostname) {
    return trimmed;
  }

  const filename = trimmed.slice(LOCAL_PRODUCT_UPLOAD_PREFIX.length);
  return `https://${hostname}/product-images/${filename}`;
}

/** Evita el optimizador de Next.js para Blob y rutas locales de uploads del admin. */
export function shouldBypassImageOptimizer(src: string): boolean {
  return (
    isBlobStorageImageUrl(src) ||
    isLocalProductUploadPath(src) ||
    src.startsWith(LOCAL_PRODUCT_UPLOAD_PREFIX)
  );
}
