import type { ProductImageFocus } from "@/lib/product-images";

export const logoPath = "/images/general/logo.png";

export interface HeroTechnicalDetail {
  label: string;
  value: string;
}

export interface HeroProductBanner {
  productId: string;
  src: string;
  name: string;
  capacity: string;
  description: string;
  technicalDetails: HeroTechnicalDetail[];
  features: string[];
  categoryLabel: string;
  catalogLabel: string;
  carouselFocus: ProductImageFocus;
}
