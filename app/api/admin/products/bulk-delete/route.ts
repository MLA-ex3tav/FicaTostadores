import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { canPersistProducts } from "@/lib/products-repository";
import { FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase-admin-config";
import { deleteProducts } from "@/lib/products-server";
import { revalidateProductPages } from "@/lib/revalidate-products";
import {
  parseJsonBody,
  RequestValidationError,
  validationErrorResponse,
} from "@/lib/validation/parse-request";
import { parseProductIdParam } from "@/lib/validation/product-input";

const MAX_DELETE_IDS = 500;

export async function POST(request: Request) {
  const guard = await requireStaffApi(request, "write");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      { error: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE },
      { status: 503 },
    );
  }

  let body: { ids?: unknown };

  try {
    body = await parseJsonBody<{ ids?: unknown }>(request);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json(
      { error: "Se requiere al menos un ID de producto." },
      { status: 400 },
    );
  }

  if (body.ids.length > MAX_DELETE_IDS) {
    return NextResponse.json(
      { error: "Demasiados productos para eliminar." },
      { status: 400 },
    );
  }

  const ids: string[] = [];
  const seen = new Set<string>();

  try {
    for (const value of body.ids) {
      if (typeof value !== "string") {
        throw new RequestValidationError("ID de producto inválido.");
      }

      const id = parseProductIdParam(value);

      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    throw error;
  }

  try {
    await deleteProducts(ids);
  } catch (error) {
    console.error("[admin/products/bulk-delete]", error);

    const message =
      error instanceof Error ? error.message : "No se pudieron eliminar los productos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  revalidateProductPages();

  return NextResponse.json({ ok: true, deleted: ids.length });
}
