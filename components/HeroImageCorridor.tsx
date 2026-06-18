"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaImage from "./MediaImage";
import type { HeroProductBanner } from "@/lib/images";

interface HeroImageCorridorProps {
  banners: HeroProductBanner[];
}

const AUTO_SCROLL_SPEED = 0.55;
const RESUME_DELAY_MS = 2500;

function HeroBannerSlide({
  banner,
  priority,
  width,
}: {
  banner: HeroProductBanner;
  priority: boolean;
  width: number | null;
}) {
  return (
    <Link
      href={`/productos/${banner.productId}`}
      style={width ? { width } : undefined}
      className="group relative h-full shrink-0 overflow-hidden rounded-xl border border-steel-dark/40 transition-colors hover:border-orange/70"
      draggable={false}
    >
      <MediaImage
        src={banner.src}
        alt={banner.name}
        className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
        fallbackClassName="h-full w-full"
        priority={priority}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8">
        <p className="text-xs uppercase tracking-widest text-orange md:text-sm">
          {banner.capacity}
        </p>
        <h3 className="mt-1 font-display text-xl leading-tight tracking-wide text-steel-light transition-colors group-hover:text-orange sm:text-2xl md:text-3xl">
          {banner.name}
        </h3>
        <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-relaxed text-steel-mid md:text-base">
          {banner.description}
        </p>
        <span className="mt-4 inline-block text-xs uppercase tracking-wider text-steel-dark transition-colors group-hover:text-orange">
          Ver producto
        </span>
      </div>
    </Link>
  );
}

export default function HeroImageCorridor({ banners }: HeroImageCorridorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const userInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [slideWidth, setSlideWidth] = useState<number | null>(null);

  const loopSlides = useMemo(
    () => [...banners, ...banners],
    [banners],
  );

  const wrapScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const setWidth = element.scrollWidth / 2;
    if (setWidth <= 0) {
      return;
    }

    if (element.scrollLeft >= setWidth) {
      element.scrollLeft -= setWidth;
    } else if (element.scrollLeft <= 0) {
      element.scrollLeft += setWidth;
    }
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const updateSlideWidth = () => {
      setSlideWidth(element.clientWidth);
    };

    updateSlideWidth();
    const observer = new ResizeObserver(updateSlideWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || banners.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animationFrameId = 0;

    const tick = () => {
      if (
        !prefersReducedMotion &&
        !pausedRef.current &&
        !userInteractingRef.current
      ) {
        element.scrollLeft += AUTO_SCROLL_SPEED;
        wrapScroll();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    const onScroll = () => {
      wrapScroll();
    };

    const pauseForInteraction = () => {
      userInteractingRef.current = true;
      pausedRef.current = true;

      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };

    const scheduleResume = () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }

      resumeTimeoutRef.current = setTimeout(() => {
        userInteractingRef.current = false;
        pausedRef.current = false;
      }, RESUME_DELAY_MS);
    };

    const pauseForHover = () => {
      pausedRef.current = true;
    };

    const resumeFromHover = () => {
      if (!userInteractingRef.current) {
        pausedRef.current = false;
      }
    };

    element.addEventListener("scroll", onScroll, { passive: true });
    element.addEventListener("touchstart", pauseForInteraction, {
      passive: true,
    });
    element.addEventListener("touchend", scheduleResume, { passive: true });
    element.addEventListener("touchcancel", scheduleResume, { passive: true });
    element.addEventListener("pointerdown", pauseForInteraction);
    element.addEventListener("pointerup", scheduleResume);
    element.addEventListener("mouseenter", pauseForHover);
    element.addEventListener("mouseleave", resumeFromHover);

    return () => {
      cancelAnimationFrame(animationFrameId);
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("touchstart", pauseForInteraction);
      element.removeEventListener("touchend", scheduleResume);
      element.removeEventListener("touchcancel", scheduleResume);
      element.removeEventListener("pointerdown", pauseForInteraction);
      element.removeEventListener("pointerup", scheduleResume);
      element.removeEventListener("mouseenter", pauseForHover);
      element.removeEventListener("mouseleave", resumeFromHover);

      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [banners, wrapScroll]);

  if (banners.length === 0) {
    return (
      <div className="relative flex h-[clamp(16rem,42vh,28rem)] w-full items-center justify-center overflow-hidden rounded-xl border border-steel-dark/30 bg-panel/40 md:h-[clamp(18rem,48vh,32rem)]">
        <p className="max-w-md px-6 text-center text-sm text-steel-mid">
          Las fotos de los productos aparecerán aquí cuando las suba desde el
          panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[clamp(16rem,42vh,28rem)] w-full overflow-hidden rounded-xl border border-steel-dark/30 bg-panel/40 md:h-[clamp(18rem,48vh,32rem)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background via-background/90 to-transparent md:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background via-background/90 to-transparent md:w-12" />

      <div
        ref={scrollRef}
        className="hero-corridor-scroll h-full overflow-x-auto overflow-y-hidden"
        aria-label="Carrusel de productos"
      >
        <div className="flex h-full w-max items-stretch gap-4 py-4 md:gap-5 md:py-5">
          {loopSlides.map((banner, index) => (
            <HeroBannerSlide
              key={`${banner.productId}-${index}`}
              banner={banner}
              priority={index < 2}
              width={slideWidth}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
