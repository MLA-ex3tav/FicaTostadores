export type ProductCatalog = "cafe" | "frutos";

export const productCatalogs: {
  id: ProductCatalog;
  label: string;
}[] = [
  {
    id: "cafe",
    label: "Tostadores de café",
  },
  {
    id: "frutos",
    label: "Frutos secos y trigo",
  },
];

export function getCatalogLabel(id: ProductCatalog) {
  return productCatalogs.find((catalog) => catalog.id === id)?.label ?? id;
}
