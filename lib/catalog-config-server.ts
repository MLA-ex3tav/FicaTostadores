import {
  loadCatalogConfig,
  saveCatalogConfig,
} from "@/lib/catalog-config-repository";
import type { CatalogConfig } from "@/lib/catalog-config";

export async function getCatalogConfig(): Promise<CatalogConfig> {
  return loadCatalogConfig();
}

export async function updateCatalogConfig(
  config: CatalogConfig,
): Promise<CatalogConfig> {
  await saveCatalogConfig(config);
  return config;
}
