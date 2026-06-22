import {
  defaultCatalogConfig,
  getCatalogLabel,
  getCategoryLabel,
} from "@/lib/catalog-config";
import type { HeroProductBanner } from "@/lib/images";
import {
  CAROUSEL_DEFAULT_FOCUS,
  getCarouselImageSrc,
} from "@/lib/product-images";
import { loadProducts } from "@/lib/products-repository";

export async function getHeroProductBanners(): Promise<HeroProductBanner[]> {
  const products = await loadProducts();
  const banners: HeroProductBanner[] = [];

  for (const product of products) {
    const primaryImage = product.images?.[0];
    const src = getCarouselImageSrc(primaryImage);
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
      carouselFocus: primaryImage?.carousel.focus ?? CAROUSEL_DEFAULT_FOCUS,
    });
  }

  return banners;
}
