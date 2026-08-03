import { resolveStorageImageUrl } from "@/lib/blob-storage";

export interface ProductImageFocus {
  x: number;
  y: number;
}

export interface ProductImageView {
  src: string;
  focus: ProductImageFocus;
}

export interface ProductImage {
  carousel: ProductImageView;
  product: ProductImageView;
}

export const DEFAULT_IMAGE_FOCUS: ProductImageFocus = { x: 50, y: 50 };

/** Punto de encuadre por defecto para carrusel (centrado). */
export const CAROUSEL_DEFAULT_FOCUS: ProductImageFocus = { x: 50, y: 50 };

/** Contenedor del carrusel: proporción 5:2 a ancho completo. */
export const CAROUSEL_CONTAINER_CLASS =
  "relative w-full aspect-[5/2] min-h-[15rem]";

export const CAROUSEL_IMAGE_SPEC = {
  label: "Vista carrusel",
  aspectRatio: "5:2",
  width: 2400,
  height: 960,
  hint: "2400 × 960 px · proporción 5:2 · JPG o WebP · clic o arrastre para encuadrar",
} as const;

export const PRODUCT_IMAGE_SPEC = {
  label: "Vista productos",
  aspectRatio: "3:2",
  width: 1200,
  height: 800,
  hint: "1200 × 800 px · proporción 3:2 · JPG o WebP · clic o arrastre para encuadrar",
} as const;

/** Preview del admin para la vista de ficha y catálogo. */
export const PRODUCT_IMAGE_CONTAINER_CLASS = "relative aspect-[3/2] w-full";

export function clampFocus(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function focusToObjectPosition(focus: ProductImageFocus): string {
  return `${focus.x}% ${focus.y}%`;
}

function createProductImageView(
  src: string,
  focus: ProductImageFocus = DEFAULT_IMAGE_FOCUS,
): ProductImageView {
  return {
    src,
    focus: { ...focus },
  };
}

export function createProductImage(
  carouselSrc: string,
  productSrc?: string,
): ProductImage {
  return {
    carousel: createProductImageView(carouselSrc, CAROUSEL_DEFAULT_FOCUS),
    product: createProductImageView(productSrc ?? carouselSrc),
  };
}

export function createGalleryImage(src: string): ProductImage {
  return {
    carousel: createProductImageView(""),
    product: createProductImageView(src),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function extractViewSrc(view: unknown): string {
  if (!isRecord(view)) {
    return "";
  }

  const src = view.src;
  return typeof src === "string" ? src.trim() : "";
}

function sanitizeView(
  view: unknown,
  fallbackSrc: string,
  legacyFocus?: unknown,
): ProductImageView {
  const src = extractViewSrc(view) || fallbackSrc;
  let focus: ProductImageFocus;

  if (isRecord(view) && view.focus !== undefined) {
    focus = sanitizeFocus(view.focus);
  } else if (isRecord(view) && (view.x !== undefined || view.y !== undefined)) {
    focus = sanitizeFocus(view);
  } else if (legacyFocus !== undefined) {
    focus = sanitizeFocus(legacyFocus);
  } else {
    focus = { ...DEFAULT_IMAGE_FOCUS };
  }

  return { src, focus };
}

export function normalizeProductImage(value: unknown): ProductImage | null {
  if (typeof value === "string" && value.trim()) {
    return createProductImage(value.trim());
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const legacySrc = typeof record.src === "string" ? record.src.trim() : "";
  const flatCarouselSrc =
    typeof record.carouselSrc === "string" ? record.carouselSrc.trim() : "";
  const flatProductSrc =
    typeof record.productSrc === "string" ? record.productSrc.trim() : "";

  const carouselSrc =
    flatCarouselSrc || extractViewSrc(record.carousel) || legacySrc;
  const productSrc =
    flatProductSrc || extractViewSrc(record.product) || legacySrc;

  if (!carouselSrc && !productSrc) {
    return null;
  }

  const fallbackSrc = carouselSrc || productSrc;

  return {
    carousel: sanitizeView(record.carousel, fallbackSrc, record.carousel),
    product: sanitizeView(record.product, fallbackSrc, record.product),
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

function resolveViewSrc(src: string | undefined): string | undefined {
  const trimmed = src?.trim();
  if (!trimmed) {
    return undefined;
  }

  return resolveStorageImageUrl(trimmed);
}

export function getCarouselImageSrc(
  image: ProductImage | undefined,
): string | undefined {
  return resolveViewSrc(image?.carousel.src);
}

export function getProductImageSrc(
  image: ProductImage | undefined,
): string | undefined {
  return resolveViewSrc(image?.product.src);
}

export function hasProductImageContent(image: ProductImage): boolean {
  return Boolean(image.carousel.src.trim() || image.product.src.trim());
}
