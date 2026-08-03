import HeroCarousel from "./HeroCarousel";
import HeroEntrance from "@/components/motion/HeroEntrance";
import type { HeroProductBanner } from "@/lib/images";
import { shouldBypassImageOptimizer } from "@/lib/blob-storage";
import { getImageProps } from "next/image";
import { preload } from "react-dom";

interface HeroSectionProps {
  banners: HeroProductBanner[];
}

function preloadHeroLcpImage(banner: HeroProductBanner) {
  const { props } = getImageProps({
    alt: banner.name,
    src: banner.src,
    width: 1600,
    height: 640,
    sizes: "100vw",
    quality: 80,
    priority: true,
  });

  preload(props.src, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
  });
}

export default function HeroSection({ banners }: HeroSectionProps) {
  const firstBanner = banners[0];

  if (firstBanner?.src) {
    if (shouldBypassImageOptimizer(firstBanner.src)) {
      preload(firstBanner.src, {
        as: "image",
        fetchPriority: "high",
      });
    } else {
      preloadHeroLcpImage(firstBanner);
    }
  }

  return (
    <HeroEntrance>
      <HeroCarousel banners={banners} />
    </HeroEntrance>
  );
}
