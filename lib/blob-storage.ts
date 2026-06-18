/**
 * Vercel Blob auth: legacy BLOB_READ_WRITE_TOKEN or OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN).
 * @see https://vercel.com/docs/vercel-blob/using-blob-sdk
 */

interface BlobCommandOptions {
  token?: string;
  oidcToken?: string;
  storeId?: string;
}

export function isVercelBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

export function canPersistWithBlob(): boolean {
  return isVercelBlobConfigured() || process.env.NODE_ENV !== "production";
}

export function getBlobCommandOptions(): BlobCommandOptions {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  const storeId = process.env.BLOB_STORE_ID?.trim();

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
