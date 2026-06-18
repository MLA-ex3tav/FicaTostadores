export type ProductCatalog = string;

export {
  defaultCatalogConfig,
  getCatalogLabel,
  type CatalogConfig,
  type CatalogDefinition,
} from "@/lib/catalog-config";

import { defaultCatalogConfig } from "@/lib/catalog-config";

export const productCatalogs = defaultCatalogConfig.catalogs;
