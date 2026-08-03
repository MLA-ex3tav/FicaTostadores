import { FieldValue } from "firebase-admin/firestore";
import {
  CATALOGO_CONFIG_COLLECTION,
  CATALOGO_CONFIG_DEFAULT_DOC_ID,
} from "@/lib/catalog/constants";
import {
  getFirebaseAdminFirestore,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
import type { CatalogConfig } from "@/lib/catalog-config";

export async function readCatalogConfigFromFirestore(): Promise<CatalogConfig | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  try {
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return null;
    }

    const snapshot = await db
      .collection(CATALOGO_CONFIG_COLLECTION)
      .doc(CATALOGO_CONFIG_DEFAULT_DOC_ID)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();
    if (!data || !Array.isArray(data.catalogs) || !Array.isArray(data.categories)) {
      return null;
    }

    return {
      catalogs: data.catalogs,
      categories: data.categories,
    };
  } catch (error) {
    console.error("Error al leer catalogo_config desde Firestore:", error);
    return null;
  }
}

export async function writeCatalogConfigToFirestore(
  config: CatalogConfig,
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("Firebase Admin no está configurado.");
  }

  await db
    .collection(CATALOGO_CONFIG_COLLECTION)
    .doc(CATALOGO_CONFIG_DEFAULT_DOC_ID)
    .set({
      ...config,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function hasCatalogConfigInFirestore(): Promise<boolean> {
  if (!isFirebaseAdminConfigured()) {
    return false;
  }

  try {
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return false;
    }

    const snapshot = await db
      .collection(CATALOGO_CONFIG_COLLECTION)
      .doc(CATALOGO_CONFIG_DEFAULT_DOC_ID)
      .get();
    return snapshot.exists;
  } catch {
    return false;
  }
}
