import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { canPersistCatalogConfig } from "@/lib/catalog-config-repository";
import { BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob-storage";
import {
  getCatalogConfig,
  updateCatalogConfig,
} from "@/lib/catalog-config-server";
import {
  parseJsonBody,
  RequestValidationError,
  validationErrorResponse,
} from "@/lib/validation/parse-request";
import { parseCatalogConfigInput } from "@/lib/validation/catalog-input";

function revalidateCatalogPages() {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[id]", "page");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/catalogos");
  revalidatePath("/admin/categorias");
}

export async function GET(request: Request) {
  const guard = await requireStaffApi(request, "read");

  if (!guard.ok) {
    return guard.response;
  }

  const config = await getCatalogConfig();
  return NextResponse.json({
    ...config,
    canPersist: canPersistCatalogConfig(),
  });
}

export async function PUT(request: Request) {
  const guard = await requireStaffApi(request, "write");

  if (!guard.ok) {
    return guard.response;
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
    const body = await parseJsonBody<unknown>(request);
    const configInput = parseCatalogConfigInput(body);
    const config = await updateCatalogConfig(configInput);
    revalidateCatalogPages();
    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    return NextResponse.json(
      { error: "No se pudo guardar la configuración del catálogo." },
      { status: 400 },
    );
  }
}
