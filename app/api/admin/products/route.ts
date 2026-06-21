import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { canPersistProducts } from "@/lib/products-repository";
import { FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase-admin-config";
import {
  createProduct,
  getProducts,
} from "@/lib/products-server";
import { revalidateProductPages } from "@/lib/revalidate-products";
import {
  parseJsonBody,
  RequestValidationError,
  validationErrorResponse,
} from "@/lib/validation/parse-request";
import { parseProductInput } from "@/lib/validation/product-input";

export async function GET(request: Request) {
  const guard = await requireStaffApi(request, "read");

  if (!guard.ok) {
    return guard.response;
  }

  const products = await getProducts();
  return NextResponse.json({ products, canPersist: canPersistProducts() });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi(request, "write");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      {
        error: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
      },
      { status: 503 },
    );
  }

  try {
    const body = await parseJsonBody<unknown>(request);
    const product = parseProductInput(body);

    const created = await createProduct(product);
    revalidateProductPages(created.id);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return validationErrorResponse(error);
    }

    const message =
      error instanceof Error ? error.message : "No se pudo crear el producto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
