import {
  defaultCatalogConfig,
  getCatalogLabel,
  getCategoryLabel,
} from "@/lib/catalog-config";
import type { HeroProductBanner } from "@/lib/images";
import { DEFAULT_IMAGE_FOCUS, getProductImageSrc } from "@/lib/product-images";
import { loadProducts } from "@/lib/products-repository";

export async function getHeroProductBanners(): Promise<HeroProductBanner[]> {
  const products = await loadProducts();
  const banners: HeroProductBanner[] = [];

  for (const product of products) {
    const primaryImage = product.images?.[0];
    const src = getProductImageSrc(primaryImage);
    if (!src) {
      continue;
    }

    banners.push({
      productId: product.id,
      src,
      name: product.name,
      capacity: product.capacity,
      description: product.description,
      technicalDetails: product.technicalDetails.slice(0, 6),
      features: product.features.slice(0, 4),
      categoryLabel: getCategoryLabel(product.category, defaultCatalogConfig),
      catalogLabel: getCatalogLabel(product.catalog, defaultCatalogConfig),
      carouselFocus: primaryImage?.carousel ?? DEFAULT_IMAGE_FOCUS,
    });
  }

  return banners;
}
