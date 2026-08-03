import type { CatalogConfig } from "@/lib/catalog-config";
import { sanitizeSlug, sanitizeText } from "@/lib/sanitize";
import { RequestValidationError } from "@/lib/validation/parse-request";

export function parseCatalogConfigInput(body: unknown): CatalogConfig {
  if (!body || typeof body !== "object") {
    throw new RequestValidationError("Configuración de catálogo inválida.");
  }

  const record = body as Record<string, unknown>;

  if (!Array.isArray(record.catalogs) || !Array.isArray(record.categories)) {
    throw new RequestValidationError("Formato de catálogo inválido.");
  }

  if (record.catalogs.length > 20 || record.categories.length > 50) {
    throw new RequestValidationError("Demasiados catálogos o categorías.");
  }

  const catalogs: CatalogConfig["catalogs"] = [];
  const catalogIds = new Set<string>();

  for (const item of record.catalogs) {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError("Catálogo inválido.");
    }

    const entry = item as Record<string, unknown>;
    const id = sanitizeSlug(entry.id, 50);
    const label = sanitizeText(entry.label, 100, { required: true });

    if (!id || !label) {
      throw new RequestValidationError("Catálogo inválido.");
    }

    if (catalogIds.has(id)) {
      throw new RequestValidationError(`Catálogo duplicado: ${id}`);
    }

    catalogIds.add(id);
    catalogs.push({ id, label });
  }

  const categories: CatalogConfig["categories"] = [];
  const categoryIds = new Set<string>();

  for (const item of record.categories) {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError("Categoría inválida.");
    }

    const entry = item as Record<string, unknown>;
    const id = sanitizeSlug(entry.id, 50);
    const catalogId = sanitizeSlug(entry.catalogId, 50);
    const label = sanitizeText(entry.label, 100, { required: true });
    const description = sanitizeText(entry.description, 500) ?? "";

    if (!id || !catalogId || !label) {
      throw new RequestValidationError("Categoría inválida.");
    }

    if (!catalogIds.has(catalogId)) {
      throw new RequestValidationError(
        `La categoría "${id}" referencia un catálogo inexistente.`,
      );
    }

    if (categoryIds.has(id)) {
      throw new RequestValidationError(`Categoría duplicada: ${id}`);
    }

    categoryIds.add(id);
    categories.push({ id, catalogId, label, description });
  }

  if (catalogs.length === 0) {
    throw new RequestValidationError("Debe existir al menos un catálogo.");
  }

  return { catalogs, categories };
}
