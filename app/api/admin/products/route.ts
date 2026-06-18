import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-session";
import { canPersistProducts } from "@/lib/products-repository";
import { BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob-storage";
import {
  createProduct,
  getProducts,
} from "@/lib/products-server";
import { slugifyProductId } from "@/lib/product-utils";
import type { Product } from "@/lib/products";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[id]", "page");
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await getProducts();
  return NextResponse.json({ products, canPersist: canPersistProducts() });
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      {
        error: BLOB_NOT_CONFIGURED_MESSAGE,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Product;
    const product: Product = {
      ...body,
      id: body.id?.trim() || slugifyProductId(body.name),
    };

    const created = await createProduct(product);
    revalidateProductPages();
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el producto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
