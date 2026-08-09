import { NextResponse } from "next/server";
import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getBlobErrorMessage } from "@/lib/blob-storage";
import { detectImageMime } from "@/lib/image-magic-bytes";
import {
  optimizeUploadImage,
  parseUploadImageVariant,
} from "@/lib/optimize-upload-image";
import {
  canUploadFiles,
  isAllowedImageUpload,
  saveUploadedImage,
} from "@/lib/upload-repository";

/**
 * POST /api/electron/upload
 *
 * Sube una imagen de producto desde la app de escritorio (FicaTostadoresAPPv2).
 * Convierte a WebP (variantes "product" 3:2 o "carousel" 5:2) y la guarda en
 * Vercel Blob. Protegido con el secreto compartido (Authorization: Bearer).
 *
 * Body: multipart/form-data con `file` (imagen) y `variant` opcional.
 * Respuesta: { url }
 */

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function POST(request: Request) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    const status = isElectronSecretConfigured() ? 401 : 503;

    return electronJson(
      {
        error:
          status === 401
            ? "Secreto de app inválido o ausente."
            : "COTIZACIONES_APP_SECRET no configurado en el servidor.",
      },
      { status },
    );
  }

  if (!canUploadFiles()) {
    return electronJson(
      {
        error:
          "En producción conecte Vercel Blob Storage al proyecto (Storage → Blob → Connect to Project) y redeploy.",
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return electronJson(
        { error: "No se recibió ninguna imagen." },
        { status: 400 },
      );
    }

    if (!isAllowedImageUpload(file)) {
      return electronJson(
        {
          error: "Formato no permitido. Use JPG, PNG, WebP, GIF, HEIC o AVIF.",
        },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return electronJson(
        { error: "La imagen no puede superar 5 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(buffer);

    if (!detectedMime) {
      return electronJson(
        {
          error:
            "El archivo no es una imagen válida. Use JPG, PNG, WebP, GIF, HEIC o AVIF.",
        },
        { status: 400 },
      );
    }

    const variant = parseUploadImageVariant(formData.get("variant"));
    const optimizedBuffer = await optimizeUploadImage(buffer, variant);
    const url = await saveUploadedImage(
      optimizedBuffer,
      "image/webp",
      "image.webp",
    );

    return electronJson({ ok: true, url });
  } catch (error) {
    console.error("[electron/upload]", error);

    return electronJson(
      {
        error: `No se pudo subir la imagen. ${getBlobErrorMessage(error)}`,
      },
      { status: 400 },
    );
  }
}
