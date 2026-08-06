import {
  deleteProductFromFirestore,
  deleteProductsFromFirestore,
  upsertProductInFirestore,
} from "@/lib/catalog/firestore-product-repository";
import { loadProducts, saveProducts } from "@/lib/products-repository";
import { normalizeProductRecord } from "@/lib/products/normalize-product";
import type { Product } from "@/lib/products";

export async function getProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find((product) => product.id === id);
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter((product) => product.category === category);
}

export async function getProductsByCatalog(
  catalog: string,
): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter((product) => product.catalog === catalog);
}

export async function createProduct(product: Product): Promise<Product> {
  const normalized = normalizeProductRecord(product);
  const products = await loadProducts();

  if (products.some((item) => item.id === normalized.id)) {
    throw new Error("Ya existe un producto con ese identificador.");
  }

  await upsertProductInFirestore(normalized);
  return normalized;
}

export async function updateProduct(
  id: string,
  product: Product,
): Promise<Product> {
  const normalized = normalizeProductRecord(product);
  const products = await loadProducts();
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Producto no encontrado.");
  }

  if (
    normalized.id !== id &&
    products.some((item) => item.id === normalized.id)
  ) {
    throw new Error("Ya existe un producto con ese identificador.");
  }

  if (normalized.id !== id) {
    // Conserva precios de app/móvil al renombrar el ID, luego borra el doc viejo.
    await upsertProductInFirestore(normalized, { preservePricesFromId: id });
    await deleteProductFromFirestore(id);
  } else {
    await upsertProductInFirestore(normalized);
  }

  return normalized;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await loadProducts();

  if (!products.some((item) => item.id === id)) {
    throw new Error("Producto no encontrado.");
  }

  await deleteProductFromFirestore(id);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const products = await loadProducts();
  const existingIds = new Set(products.map((item) => item.id));

  if (ids.some((id) => !existingIds.has(id))) {
    throw new Error("Algunos productos no existen.");
  }

  await deleteProductsFromFirestore(ids);
}

/** Reemplaza todo el catálogo (solo migraciones o mantenimiento). */
export async function replaceAllProducts(products: Product[]): Promise<void> {
  await saveProducts(products);
}
