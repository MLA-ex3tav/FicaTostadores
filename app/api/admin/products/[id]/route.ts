import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { canPersistProducts } from "@/lib/products-repository";
import { BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob-storage";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/products-server";
import { revalidateProductPages } from "@/lib/revalidate-products";
import {
  parseJsonBody,
  RequestValidationError,
  validationErrorResponse,
} from "@/lib/validation/parse-request";
import {
  parseProductIdParam,
  parseProductInput,
} from "@/lib/validation/product-input";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const guard = await requireStaffApi(_request, "read");

  if (!guard.ok) {
    return guard.response;
  }

  const { id: rawId } = await context.params;

  let id: string;

  try {
    id = parseProductIdParam(rawId);
  } catch (error) {
    return validationErrorResponse(error);
  }

  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(request: Request, context: RouteContext) {
  const guard = await requireStaffApi(request, "write");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      {
        error: BLOB_NOT_CONFIGURED_MESSAGE,
      },
      { status: 503 },
    );
  }

  const { id: rawId } = await context.params;

  let id: string;

  try {
    id = parseProductIdParam(rawId);
    const body = await parseJsonBody<unknown>(request);
    const product = parseProductInput(body);
    const updated = await updateProduct(id, product);
    revalidateProductPages(updated.id);
    return NextResponse.json({ product: updated });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireStaffApi(_request, "write");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      {
        error: BLOB_NOT_CONFIGURED_MESSAGE,
      },
      { status: 503 },
    );
  }

  const { id: rawId } = await context.params;

  let id: string;

  try {
    id = parseProductIdParam(rawId);
    await deleteProduct(id);
    revalidateProductPages(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el producto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
