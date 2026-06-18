import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-session";
import {
  canUploadFiles,
  saveUploadedImage,
} from "@/lib/upload-repository";

export async function POST(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canUploadFiles()) {
    return NextResponse.json(
      {
        error:
          "En producción configure BLOB_READ_WRITE_TOKEN en Vercel para subir imágenes.",
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de imagen." },
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
    const url = await saveUploadedImage(buffer, file.type, file.name);

    revalidatePath("/");

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 400 },
    );
  }
}
