import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { PRODUCTOS_COLLECTION } from "@/lib/catalog/constants";
import {
  getFirebaseAdminFirestore,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
import { normalizeProductRecord } from "@/lib/products/normalize-product";
import type { Product } from "@/lib/products";

function mapDocToProduct(
  id: string,
  data: DocumentData,
): Product | null {
  const { updatedAt: _updatedAt, ...rest } = data;
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

    if (snapshot.empty) {
      return null;
    }

    const products = snapshot.docs
      .map((doc) => mapDocToProduct(doc.id, doc.data()))
      .filter((product): product is Product => product !== null);

    return products.length > 0 ? products : null;
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
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function upsertProductInFirestore(
  product: Product,
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  await db.collection(PRODUCTOS_COLLECTION).doc(product.id).set({
      ...product,
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
