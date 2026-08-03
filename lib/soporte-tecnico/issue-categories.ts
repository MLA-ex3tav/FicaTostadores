export const TECHNICAL_ISSUE_CATEGORIES = [
  { id: "falla_operativa", label: "Falla / dejó de funcionar" },
  { id: "mantenimiento", label: "Mantenimiento preventivo" },
  { id: "repuestos", label: "Repuestos" },
  { id: "instalacion", label: "Instalación o puesta en marcha" },
  { id: "otro", label: "Otro" },
] as const;

export type TechnicalIssueCategoryId =
  (typeof TECHNICAL_ISSUE_CATEGORIES)[number]["id"];

const CATEGORY_LABELS = new Map<string, string>(
  TECHNICAL_ISSUE_CATEGORIES.map((category) => [category.id, category.label]),
);

export function getTechnicalIssueCategoryLabel(
  categoryId: TechnicalIssueCategoryId,
): string {
  return CATEGORY_LABELS.get(categoryId) ?? categoryId;
}

export function isTechnicalIssueCategoryId(
  value: string,
): value is TechnicalIssueCategoryId {
  return CATEGORY_LABELS.has(value);
}
