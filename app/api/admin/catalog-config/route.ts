import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-session";
import type { CatalogConfig } from "@/lib/catalog-config";
import { canPersistCatalogConfig } from "@/lib/catalog-config-repository";
import { BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob-storage";
import {
  getCatalogConfig,
  updateCatalogConfig,
} from "@/lib/catalog-config-server";

function revalidateCatalogPages() {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[id]", "page");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/catalogos");
  revalidatePath("/admin/categorias");
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await getCatalogConfig();
  return NextResponse.json({
    ...config,
    canPersist: canPersistCatalogConfig(),
  });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canPersistCatalogConfig()) {
    return NextResponse.json(
      {
        error: BLOB_NOT_CONFIGURED_MESSAGE,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as CatalogConfig;

    if (!Array.isArray(body.catalogs) || !Array.isArray(body.categories)) {
      return NextResponse.json(
        { error: "Formato de catálogo inválido." },
        { status: 400 },
      );
    }

    const config = await updateCatalogConfig(body);
    revalidateCatalogPages();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la configuración del catálogo." },
      { status: 400 },
    );
  }
}
