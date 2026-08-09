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
  canUploadFiles,
  isAllowedImageUpload,
  saveUploadedImage,
} from "@/lib/upload-repository";

/**
 * POST /api/electron/upload
 *
 * Sube una imagen de producto desde la app de escritorio (FicaTostadoresAPPv2).
 * La app v2 ya convierte a WebP y recorta en el cliente (canvas), así que aquí
 * solo validamos y guardamos el archivo en Vercel Blob. Evita re-procesar con
 * sharp en el runtime serverless de Vercel (evita fallos de SharedArrayBuffer).
 * Protegido con el secreto compartido (Authorization: Bearer).
 *
 * Body: multipart/form-data con `file` (WebP) y `variant` opcional.
 * Respuesta: { ok, url }
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

    // La app v2 ya envía WebP optimizado; guardamos directo en Blob.
    const url = await saveUploadedImage(buffer, detectedMime, file.name);

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
