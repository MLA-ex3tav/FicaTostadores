import { resolveStorageImageUrl } from "@/lib/blob-storage";
import { normalizeProductImages } from "@/lib/product-images";
import type { Product } from "@/lib/products";

export function normalizeProductRecord(product: Product): Product {
  return {
    ...product,
    images: normalizeProductImages(product.images).map((image) => ({
      carousel: {
        ...image.carousel,
        src: resolveStorageImageUrl(image.carousel.src),
      },
      product: {
        ...image.product,
        src: resolveStorageImageUrl(image.product.src),
      },
    })),
  };
}

export function normalizeProductRecords(products: Product[]): Product[] {
  return products.map(normalizeProductRecord);
}
