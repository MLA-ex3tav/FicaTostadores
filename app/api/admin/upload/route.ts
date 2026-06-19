import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { getBlobErrorMessage } from "@/lib/blob-storage";
import { detectImageMime } from "@/lib/image-magic-bytes";
import {
  canUploadFiles,
  isAllowedImageUpload,
  normalizeImageContentType,
  saveUploadedImage,
} from "@/lib/upload-repository";

export async function POST(request: Request) {
  const guard = await requireStaffApi(request, "upload");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canUploadFiles()) {
    return NextResponse.json(
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
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 },
      );
    }

    if (!isAllowedImageUpload(file)) {
      return NextResponse.json(
        {
          error:
            "Formato no permitido. Use JPG, PNG, WebP, GIF, HEIC o AVIF.",
        },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no puede superar 5 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(buffer);

    if (!detectedMime) {
      return NextResponse.json(
        {
          error:
            "El archivo no es una imagen válida. Use JPG, PNG, WebP, GIF, HEIC o AVIF.",
        },
        { status: 400 },
      );
    }

    const contentType = normalizeImageContentType(
      detectedMime || file.type,
      file.name,
    );
    const url = await saveUploadedImage(buffer, contentType, file.name);

    revalidatePath("/");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json(
      {
        error: `No se pudo subir la imagen. ${getBlobErrorMessage(error)}`,
      },
      { status: 400 },
    );
  }
}
