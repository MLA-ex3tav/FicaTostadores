export type ProductCategory = string;

export {
  defaultCatalogConfig,
  getCategoriesForCatalog,
  getCategoryLabel,
  shouldShowCategoryForCatalog,
  type CatalogConfig,
  type CategoryDefinition,
} from "@/lib/catalog-config";

import { defaultCatalogConfig } from "@/lib/catalog-config";

export const productCategories = defaultCatalogConfig.categories;
