import HeroCarousel from "./HeroCarousel";
import type { HeroProductBanner } from "@/lib/images";

interface HeroSectionProps {
  banners: HeroProductBanner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  return <HeroCarousel banners={banners} />;
}
