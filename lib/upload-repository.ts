import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  canPersistWithBlob,
  getBlobCommandOptions,
  isVercelBlobConfigured,
} from "@/lib/blob-storage";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const CONTENT_TYPE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
};

function extensionFromContentType(contentType: string): string | null {
  return CONTENT_TYPE_EXTENSION[contentType.toLowerCase()] ?? null;
}

function extensionFromName(filename: string): string | null {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function isAllowedImageUpload(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return true;
  }

  if (!file.type || file.type === "application/octet-stream") {
    return /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(file.name);
  }

  return false;
}

export function normalizeImageContentType(
  contentType: string,
  filename: string,
): string {
  if (contentType.startsWith("image/")) {
    return contentType;
  }

  const extension = extensionFromName(filename);
  if (extension && EXTENSION_CONTENT_TYPE[extension]) {
    return EXTENSION_CONTENT_TYPE[extension];
  }

  return "image/jpeg";
}

export function canUploadFiles(): boolean {
  return canPersistWithBlob();
}

export async function saveUploadedImage(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<string> {
  const normalizedType = normalizeImageContentType(contentType, originalName);
  const extension =
    extensionFromContentType(normalizedType) ??
    extensionFromName(originalName) ??
    "jpg";
  const filename = `${randomUUID()}.${extension}`;

  if (isVercelBlobConfigured()) {
    const blob = await put(`product-images/${filename}`, buffer, {
      ...getBlobCommandOptions(),
      access: "public",
      contentType: normalizedType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
  return `/uploads/products/${filename}`;
}
