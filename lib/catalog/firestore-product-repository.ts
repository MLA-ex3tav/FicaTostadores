import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { PRODUCTOS_COLLECTION } from "@/lib/catalog/constants";
import {
  getFirebaseAdminFirestore,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
import { normalizeProductRecord } from "@/lib/products/normalize-product";
import type { Product } from "@/lib/products";

/** Campos de precio gestionados por app/móvil; la web no debe pisarlos. */
const PRICE_FIELD_KEYS = [
  "listPrice",
  "price",
  "precio",
  "priceUpdatedAt",
] as const;

type PriceFields = Partial<
  Record<(typeof PRICE_FIELD_KEYS)[number], unknown>
>;

function extractPriceFields(data: DocumentData | undefined): PriceFields {
  if (!data) {
    return {};
  }

  const fields: PriceFields = {};

  for (const key of PRICE_FIELD_KEYS) {
    if (data[key] !== undefined) {
      fields[key] = data[key];
    }
  }

  return fields;
}

function mapDocToProduct(
  id: string,
  data: DocumentData,
): Product | null {
  const {
    updatedAt: _updatedAt,
    priceUpdatedAt: _priceUpdatedAt,
    listPrice: _listPrice,
    price: _price,
    precio: _precio,
    ...rest
  } = data;
  if (typeof rest.name !== "string") {
    return null;
  }

  return normalizeProductRecord({
    ...rest,
    id: typeof rest.id === "string" ? rest.id : id,
  } as Product);
}

export async function readProductsFromFirestore(): Promise<Product[] | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  try {
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return null;
    }

    const snapshot = await db.collection(PRODUCTOS_COLLECTION).get();

    const products = snapshot.docs
      .map((doc) => mapDocToProduct(doc.id, doc.data()))
      .filter((product): product is Product => product !== null);

    return products;
  } catch (error) {
    console.error("Error al leer productos desde Firestore:", error);
    return null;
  }
}

export async function writeProductsToFirestore(
  products: Product[],
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const collection = db.collection(PRODUCTOS_COLLECTION);
  const existing = await collection.get();
  const existingById = new Map(
    existing.docs.map((doc) => [doc.id, doc.data()]),
  );
  const nextIds = new Set(products.map((product) => product.id));

  const batch = db.batch();

  for (const doc of existing.docs) {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  }

  for (const product of products) {
    batch.set(collection.doc(product.id), {
      ...product,
      ...extractPriceFields(existingById.get(product.id)),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function upsertProductInFirestore(
  product: Product,
  options?: { preservePricesFromId?: string },
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const ref = db.collection(PRODUCTOS_COLLECTION).doc(product.id);
  const priceSourceId = options?.preservePricesFromId ?? product.id;
  const priceSourceRef =
    priceSourceId === product.id
      ? ref
      : db.collection(PRODUCTOS_COLLECTION).doc(priceSourceId);
  const existing = await priceSourceRef.get();

  await ref.set({
    ...product,
    ...extractPriceFields(existing.data()),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteProductFromFirestore(
  productId: string,
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  await db.collection(PRODUCTOS_COLLECTION).doc(productId).delete();
}

export async function deleteProductsFromFirestore(
  productIds: string[],
): Promise<void> {
  if (productIds.length === 0) {
    return;
  }

  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const collection = db.collection(PRODUCTOS_COLLECTION);
  const batch = db.batch();

  for (const id of productIds) {
    batch.delete(collection.doc(id));
  }

  await batch.commit();
}

export async function hasProductsInFirestore(): Promise<boolean> {
  if (!isFirebaseAdminConfigured()) {
    return false;
  }

  try {
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return false;
    }

    const snapshot = await db
      .collection(PRODUCTOS_COLLECTION)
      .limit(1)
      .get();
    return !snapshot.empty;
  } catch {
    return false;
  }
}
