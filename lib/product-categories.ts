import type { ProductCatalog } from "./product-catalogs";

export type ProductCategory = "cafe" | "comercial" | "industrial" | "procesamiento";

export const productCategories: {
  id: ProductCategory;
  catalog: ProductCatalog;
  label: string;
  description: string;
}[] = [
  {
    id: "cafe",
    catalog: "cafe",
    label: "Línea TLC",
    description: "Tostadores de café de especialidad y producción artesanal.",
  },
  {
    id: "comercial",
    catalog: "frutos",
    label: "Tostadores comerciales",
    description: "Maní, avellanas, trigo, almendras, semillas y más. Gas o leña.",
  },
  {
    id: "industrial",
    catalog: "frutos",
    label: "Tostadores industriales",
    description: "Alta capacidad para plantas de producción continua.",
  },
  {
    id: "procesamiento",
    catalog: "frutos",
    label: "Equipos de procesamiento",
    description: "Partidores, molinos y descascaradores.",
  },
];

export function getCategoryLabel(id: ProductCategory) {
  return productCategories.find((category) => category.id === id)?.label ?? id;
}

export function getCategoriesForCatalog(catalog: ProductCatalog) {
  return productCategories.filter((category) => category.catalog === catalog);
}
