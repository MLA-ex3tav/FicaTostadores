import { loadProducts } from "@/lib/products-repository";
import type { HeroProductBanner } from "@/lib/images";

export async function getHeroProductBanners(): Promise<HeroProductBanner[]> {
  const products = await loadProducts();
  const banners: HeroProductBanner[] = [];

  for (const product of products) {
    const src = product.images?.[0];
    if (!src) {
      continue;
    }

    banners.push({
      productId: product.id,
      src,
      name: product.name,
      capacity: product.capacity,
      description: product.description,
    });
  }

  return banners;
}
