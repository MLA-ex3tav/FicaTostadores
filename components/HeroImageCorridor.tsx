"use client";

import MediaImage from "./MediaImage";
import { heroCarouselImages } from "@/lib/images";

export default function HeroImageCorridor() {
  const loopSlides = [...heroCarouselImages, ...heroCarouselImages];

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-xl border border-steel-dark/30 bg-panel/40 sm:h-60 md:h-full md:min-h-[22rem]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-20" />

      <div className="hero-corridor-track flex h-full items-stretch gap-3 px-3 py-3 motion-reduce:animate-none md:gap-4 md:px-4">
        {loopSlides.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="relative h-full w-44 shrink-0 sm:w-52 md:w-60"
          >
            <MediaImage
              src={image.src}
              alt={image.alt}
              className="h-full w-full rounded-lg"
              fallbackClassName="h-full w-full rounded-lg"
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
