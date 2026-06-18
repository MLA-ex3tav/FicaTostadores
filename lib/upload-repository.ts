import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  canPersistWithBlob,
  isVercelBlobConfigured,
} from "@/lib/blob-storage";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const CONTENT_TYPE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function extensionFromContentType(contentType: string): string | null {
  return CONTENT_TYPE_EXTENSION[contentType.toLowerCase()] ?? null;
}

function extensionFromName(filename: string): string | null {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function canUploadFiles(): boolean {
  return canPersistWithBlob();
}

export async function saveUploadedImage(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<string> {
  const extension =
    extensionFromContentType(contentType) ??
    extensionFromName(originalName) ??
    "jpg";
  const filename = `${randomUUID()}.${extension}`;

  if (isVercelBlobConfigured()) {
    const blob = await put(`product-images/${filename}`, buffer, {
      access: "public",
      contentType,
    });
    return blob.url;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
  return `/uploads/products/${filename}`;
}
