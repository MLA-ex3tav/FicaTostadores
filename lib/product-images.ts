export interface ProductImageFocus {
  x: number;
  y: number;
}

export interface ProductImage {
  src: string;
  carousel: ProductImageFocus;
  product: ProductImageFocus;
}

export const DEFAULT_IMAGE_FOCUS: ProductImageFocus = { x: 50, y: 50 };

export const CAROUSEL_IMAGE_SPEC = {
  label: "Vista carrusel",
  aspectRatio: "5:2",
  width: 2400,
  height: 960,
  hint: "2400 × 960 px · proporción 5:2 · JPG o WebP",
} as const;

export const PRODUCT_IMAGE_SPEC = {
  label: "Vista productos",
  aspectRatio: "4:3",
  width: 1200,
  height: 900,
  hint: "1200 × 900 px · proporción 4:3 · JPG o WebP",
} as const;

export function clampFocus(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function focusToObjectPosition(focus: ProductImageFocus): string {
  return `${focus.x}% ${focus.y}%`;
}

export function createProductImage(src: string): ProductImage {
  return {
    src,
    carousel: { ...DEFAULT_IMAGE_FOCUS },
    product: { ...DEFAULT_IMAGE_FOCUS },
  };
}

function sanitizeFocus(value: unknown): ProductImageFocus {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_IMAGE_FOCUS };
  }

  const record = value as Record<string, unknown>;
  const x =
    typeof record.x === "number" && Number.isFinite(record.x)
      ? clampFocus(record.x)
      : DEFAULT_IMAGE_FOCUS.x;
  const y =
    typeof record.y === "number" && Number.isFinite(record.y)
      ? clampFocus(record.y)
      : DEFAULT_IMAGE_FOCUS.y;

  return { x, y };
}

export function normalizeProductImage(value: unknown): ProductImage | null {
  if (typeof value === "string" && value.trim()) {
    return createProductImage(value.trim());
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const src = typeof record.src === "string" ? record.src.trim() : "";

  if (!src) {
    return null;
  }

  return {
    src,
    carousel: sanitizeFocus(record.carousel),
    product: sanitizeFocus(record.product),
  };
}

export function normalizeProductImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const images: ProductImage[] = [];

  for (const item of value) {
    const normalized = normalizeProductImage(item);

    if (normalized) {
      images.push(normalized);
    }
  }

  return images;
}

export function getProductImageSrc(image: ProductImage | undefined): string | undefined {
  return image?.src;
}
