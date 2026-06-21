import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  readProductsFromFirestore,
  writeProductsToFirestore,
} from "@/lib/catalog/firestore-product-repository";
import { normalizeProductRecords } from "@/lib/products/normalize-product";
import { defaultProducts, type Product } from "@/lib/products";

export async function loadProducts(): Promise<Product[]> {
  if (isFirebaseAdminConfigured()) {
    const fromFirestore = await readProductsFromFirestore();
    if (fromFirestore) {
      return fromFirestore;
    }
  }

  return normalizeProductRecords(defaultProducts);
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const normalized = normalizeProductRecords(products);
  await writeProductsToFirestore(normalized);
}

export function canPersistProducts(): boolean {
  return isFirebaseAdminConfigured();
}

/** @deprecated Ya no hay caché en memoria; se mantiene por compatibilidad. */
export function invalidateProductsCache(): void {
  // no-op
}
