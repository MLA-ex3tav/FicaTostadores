import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase-admin-config";
import { canPersistProducts } from "@/lib/products-repository";
import { getProducts } from "@/lib/products-server";
import { parsePrecioListWorkbook } from "@/lib/products/excel-import";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MASTER_SHEET = "TABLA MAESTRA";

export async function POST(request: Request) {
  const guard = await requireStaffApi(request, "read");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      { error: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE },
      { status: 503 },
    );
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer la solicitud." },
      { status: 400 },
    );
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Se esperaba un archivo." },
      { status: 400 },
    );
  }

  if (!/\.xlsx$/i.test(file.name)) {
    return NextResponse.json(
      { error: "El archivo debe tener extensión .xlsx." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera los 10 MB." },
      { status: 400 },
    );
  }

  let buffer: ArrayBuffer;

  try {
    buffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo." },
      { status: 400 },
    );
  }

  try {
    const existing = await getProducts();
    const existingIds = new Set(existing.map((product) => product.id));
    const { items, sheet } = parsePrecioListWorkbook(
      buffer,
      MASTER_SHEET,
      existingIds,
    );

    return NextResponse.json({ items, sheet, total: items.length });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo leer el archivo de precios.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
