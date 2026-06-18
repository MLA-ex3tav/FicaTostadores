import { loadProducts, saveProducts } from "@/lib/products-repository";
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
  const products = await loadProducts();

  if (products.some((item) => item.id === product.id)) {
    throw new Error("Ya existe un producto con ese identificador.");
  }

  const next = [...products, product];
  await saveProducts(next);
  return product;
}

export async function updateProduct(
  id: string,
  product: Product,
): Promise<Product> {
  const products = await loadProducts();
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Producto no encontrado.");
  }

  if (product.id !== id && products.some((item) => item.id === product.id)) {
    throw new Error("Ya existe un producto con ese identificador.");
  }

  const next = [...products];
  next[index] = product;
  await saveProducts(next);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await loadProducts();
  const next = products.filter((item) => item.id !== id);

  if (next.length === products.length) {
    throw new Error("Producto no encontrado.");
  }

  await saveProducts(next);
}
