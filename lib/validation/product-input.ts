import { slugifyProductId } from "@/lib/product-utils";
import type { Product, ProductAddOn } from "@/lib/products";
import {
  normalizeProductImages,
  type ProductImage,
} from "@/lib/product-images";
import {
  sanitizeSlug,
  sanitizeStringArray,
  sanitizeText,
} from "@/lib/sanitize";
import { RequestValidationError } from "@/lib/validation/parse-request";

function sanitizeAddOns(value: unknown): ProductAddOn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 20) {
    throw new RequestValidationError("Demasiados complementos.");
  }

  const addOns: ProductAddOn[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError("Complemento inválido.");
    }

    const record = item as Record<string, unknown>;
    const id =
      sanitizeSlug(record.id, 80) ??
      (sanitizeText(record.name, 200, { required: true })
        ? slugifyProductId(String(record.name))
        : null);
    const name = sanitizeText(record.name, 200, { required: true });
    const description = sanitizeText(record.description, 500) ?? "";

    if (!id || !name) {
      throw new RequestValidationError("Complemento inválido.");
    }

    addOns.push({ id, name, description });
  }

  return addOns;
}

function sanitizeProductImagesInput(value: unknown): ProductImage[] {
  if (value !== undefined && value !== null && !Array.isArray(value)) {
    throw new RequestValidationError("Imágenes inválidas.");
  }

  if (Array.isArray(value) && value.length > 20) {
    throw new RequestValidationError("Demasiadas imágenes.");
  }

  return normalizeProductImages(value);
}

function sanitizeTechnicalDetails(
  value: unknown,
): Product["technicalDetails"] {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 30) {
    throw new RequestValidationError("Demasiados detalles técnicos.");
  }

  const details: Product["technicalDetails"] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError("Detalle técnico inválido.");
    }

    const record = item as Record<string, unknown>;
    const label = sanitizeText(record.label, 100, { required: true });
    const detailValue = sanitizeText(record.value, 200, { required: true });

    if (!label || !detailValue) {
      throw new RequestValidationError("Detalle técnico inválido.");
    }

    details.push({ label, value: detailValue });
  }

  return details;
}

export function parseProductInput(body: unknown): Product {
  if (!body || typeof body !== "object") {
    throw new RequestValidationError("Producto inválido.");
  }

  const record = body as Record<string, unknown>;
  const name = sanitizeText(record.name, 200, { required: true });
  const catalog = sanitizeSlug(record.catalog, 50);
  const category = sanitizeSlug(record.category, 50);
  const capacity = sanitizeText(record.capacity, 100, { required: true });
  const description = sanitizeText(record.description, 500, { required: true });
  const longDescription = sanitizeText(record.longDescription, 5000) ?? "";

  if (!name || !catalog || !category || !capacity || !description) {
    throw new RequestValidationError("Faltan campos obligatorios del producto.");
  }

  const requestedId = sanitizeText(record.id, 80);
  const id =
    requestedId && sanitizeSlug(requestedId)
      ? requestedId
      : slugifyProductId(name);

  if (!sanitizeSlug(id)) {
    throw new RequestValidationError("ID de producto inválido.");
  }

  const specs =
    sanitizeStringArray(record.specs, 50, 200) ??
    (() => {
      throw new RequestValidationError("Especificaciones inválidas.");
    })();

  const features =
    sanitizeStringArray(record.features, 50, 300) ??
    (() => {
      throw new RequestValidationError("Características inválidas.");
    })();

  return {
    id,
    catalog,
    category,
    name,
    capacity,
    description,
    longDescription,
    specs,
    features,
    technicalDetails: sanitizeTechnicalDetails(record.technicalDetails),
    addOns: sanitizeAddOns(record.addOns),
    images: sanitizeProductImagesInput(record.images),
  };
}

export function parseProductIdParam(value: string): string {
  const id = sanitizeSlug(value, 80);

  if (!id) {
    throw new RequestValidationError("ID de producto inválido.");
  }

  return id;
}
