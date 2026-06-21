import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  readCatalogConfigFromFirestore,
  writeCatalogConfigToFirestore,
} from "@/lib/catalog/firestore-catalog-config-repository";
import {
  defaultCatalogConfig,
  type CatalogConfig,
} from "@/lib/catalog-config";

export async function loadCatalogConfig(): Promise<CatalogConfig> {
  if (isFirebaseAdminConfigured()) {
    const fromFirestore = await readCatalogConfigFromFirestore();
    if (fromFirestore) {
      return fromFirestore;
    }
  }

  return defaultCatalogConfig;
}

export async function saveCatalogConfig(config: CatalogConfig): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin no está configurado.");
  }

  await writeCatalogConfigToFirestore(config);
}

export function canPersistCatalogConfig(): boolean {
  return isFirebaseAdminConfigured();
}
