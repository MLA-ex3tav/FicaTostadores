import { resolveStorageImageUrl } from "@/lib/blob-storage";
import { normalizeProductImages } from "@/lib/product-images";
import { parseClpPriceInput } from "@/lib/pricing";
import type { Product, ProductAddOn } from "@/lib/products";

function normalizeAddOns(addOns: ProductAddOn[] | undefined): ProductAddOn[] {
  return (addOns ?? []).map((addOn) => {
    const price = parseClpPriceInput(addOn.price);
    return {
      ...addOn,
      ...(price !== null ? { price } : {}),
    };
  });
}

export function normalizeProductRecord(product: Product): Product {
  return {
    ...product,
    listPrice: parseClpPriceInput(product.listPrice),
    addOns: normalizeAddOns(product.addOns),
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
