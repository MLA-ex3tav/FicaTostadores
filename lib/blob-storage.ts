/**
 * Vercel Blob auth: legacy BLOB_READ_WRITE_TOKEN or OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN).
 * @see https://vercel.com/docs/vercel-blob/using-blob-sdk
 */
export function isVercelBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

export function canPersistWithBlob(): boolean {
  return isVercelBlobConfigured() || process.env.NODE_ENV !== "production";
}

export const BLOB_NOT_CONFIGURED_MESSAGE =
  "En producción conecte Vercel Blob Storage al proyecto (Storage → Blob → Connect to Project) y redeploy.";
