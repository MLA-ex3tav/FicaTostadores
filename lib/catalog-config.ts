export interface CatalogDefinition {
  id: string;
  label: string;
}

export interface CategoryDefinition {
  id: string;
  catalogId: string;
  label: string;
  description: string;
}

export interface CatalogConfig {
  catalogs: CatalogDefinition[];
  categories: CategoryDefinition[];
}

export const defaultCatalogConfig: CatalogConfig = {
  catalogs: [
    { id: "cafe", label: "Tostadores de café" },
    { id: "frutos", label: "Frutos secos y trigo" },
  ],
  categories: [
    {
      id: "cafe",
      catalogId: "cafe",
      label: "Línea TLC",
      description:
        "Tostadores de café de especialidad y producción artesanal.",
    },
    {
      id: "comercial",
      catalogId: "frutos",
      label: "Tostadores comerciales",
      description:
        "Maní, avellanas, trigo, almendras, semillas y más. Gas o leña.",
    },
    {
      id: "industrial",
      catalogId: "frutos",
      label: "Tostadores industriales",
      description: "Alta capacidad para plantas de producción continua.",
    },
    {
      id: "procesamiento",
      catalogId: "frutos",
      label: "Equipos de procesamiento",
      description: "Partidores, molinos y descascaradores.",
    },
  ],
};

export function getCatalogLabel(
  id: string,
  config: CatalogConfig = defaultCatalogConfig,
): string {
  return config.catalogs.find((catalog) => catalog.id === id)?.label ?? id;
}

export function getCategoryLabel(
  id: string,
  config: CatalogConfig = defaultCatalogConfig,
): string {
  return config.categories.find((category) => category.id === id)?.label ?? id;
}

export function getCategoriesForCatalog(
  catalogId: string,
  config: CatalogConfig = defaultCatalogConfig,
): CategoryDefinition[] {
  return config.categories.filter(
    (category) => category.catalogId === catalogId,
  );
}

export function shouldShowCategoryForCatalog(
  catalogId: string,
  config: CatalogConfig = defaultCatalogConfig,
): boolean {
  return getCategoriesForCatalog(catalogId, config).length > 1;
}
