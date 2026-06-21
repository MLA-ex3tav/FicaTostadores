"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import MediaImage from "./MediaImage";
import type { HeroProductBanner } from "@/lib/images";
import { DEFAULT_IMAGE_FOCUS, focusToObjectPosition } from "@/lib/product-images";

interface HeroCarouselProps {
  banners: HeroProductBanner[];
}

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;

const DEFAULT_BANNERS: HeroProductBanner[] = [
  {
    productId: "",
    src: "",
    name: "FICA TOSTADORES",
    capacity: "Maquinaria industrial de tueste",
    description:
      "Equipos robustos para café, cacao, frutos secos, granos y semillas. Tecnología robusta, precisión en cada lote y soporte técnico especializado.",
    technicalDetails: [
      { label: "Capacidad máxima", value: "Según modelo" },
      { label: "Capacidad mínima", value: "Según modelo" },
      { label: "Producción", value: "Continua o por lote" },
      { label: "Dimensiones", value: "Consultar ficha técnica" },
      { label: "Peso neto", value: "Variable" },
      { label: "Gas", value: "GLP, natural o leña" },
    ],
    features: [
      "Fabricación chilena, IX Región",
      "Soporte técnico en instalación y mantenimiento",
      "Líneas para café, frutos secos y procesamiento",
      "Equipos a gas, eléctricos o a leña",
    ],
    categoryLabel: "Ingeniería de tueste",
    catalogLabel: "Catálogo completo",
    carouselFocus: DEFAULT_IMAGE_FOCUS,
  },
];

function splitHeadline(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return [text.toUpperCase(), ""];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" ").toUpperCase(),
    words.slice(midpoint).join(" ").toUpperCase(),
  ];
}

function shouldLoadSlideImage(
  index: number,
  activeIndex: number,
  slideCount: number,
): boolean {
  if (slideCount <= 1) {
    return true;
  }

  const previous = (activeIndex - 1 + slideCount) % slideCount;
  const next = (activeIndex + 1) % slideCount;

  return index === activeIndex || index === previous || index === next;
}

function HeroCarouselSlide({
  banner,
  priority,
  loadImage,
}: {
  banner: HeroProductBanner;
  priority: boolean;
  loadImage: boolean;
}) {
  const [headlineTop, headlineBottom] = splitHeadline(banner.name);
  const href = banner.productId ? `/productos/${banner.productId}` : "/productos";
  const hasImage = banner.src.length > 0 && loadImage;

  return (
    <div className="relative h-full w-full shrink-0 overflow-hidden">
      {hasImage ? (
        <MediaImage
          src={banner.src}
          alt={banner.name}
          className="absolute inset-0 z-0 h-full w-full"
          fallbackClassName="absolute inset-0 z-0 h-full w-full"
          priority={priority}
          objectPosition={focusToObjectPosition(banner.carouselFocus)}
          sizes="100vw"
          quality={80}
        />
      ) : (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#2a3038] via-[#1a1d22] to-[#0f1114]"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-y-0 left-0 z-[1] w-[58%] bg-gradient-to-r from-black/90 via-black/55 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/35 to-black/10"
        aria-hidden="true"
      />

      <Link
        href={href}
        className="absolute inset-0 z-[2]"
        aria-label={`Ver ${banner.name}`}
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0 z-[3] flex h-full flex-col justify-end">
        {/* Mobile: título */}
        <div className="max-w-[90%] px-5 pb-14 pt-8 sm:px-8 md:hidden">
          <p className="font-display text-xl leading-tight tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_4px_16px_rgba(0,0,0,0.9)] sm:text-2xl">
            {banner.name.toUpperCase()}
          </p>
        </div>

        {/* Desktop: bloque título */}
        <div className="hidden h-full w-full flex-col md:flex">
          <div className="flex flex-1 flex-col justify-end px-8 pb-4 pt-8 lg:px-16">
            <div className="max-w-[58%]">
              <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
                {banner.catalogLabel}
                {banner.categoryLabel ? ` · ${banner.categoryLabel}` : null}
              </p>
              <p className="mt-0.5 font-display text-[clamp(1.1rem,2.3vw,1.75rem)] leading-[0.92] tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_4px_16px_rgba(0,0,0,0.95)]">
                {headlineTop}
                {headlineBottom ? (
                  <>
                    <br />
                    {headlineBottom}
                  </>
                ) : null}
              </p>
              <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
                {banner.capacity}
              </p>
              <p className="mt-1.5 text-[0.65rem] leading-snug text-white line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                {banner.description}
              </p>
              <p className="mt-3 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
                Click para ver más info →
              </p>
            </div>
          </div>
        </div>

        {banner.technicalDetails.length > 0 ? (
          <div className="hidden border-t border-white/30 bg-black/60 px-5 py-4 backdrop-blur-sm sm:px-8 md:block md:px-8 md:py-5 lg:px-16">
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 sm:gap-x-6 md:flex md:w-full md:items-stretch md:divide-x md:divide-white/25 md:gap-0">
              {banner.technicalDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex min-w-0 flex-col justify-center gap-1 md:flex-1 md:gap-1.5 md:px-4 lg:px-5 first:md:pl-0 last:md:pr-0"
                >
                  <dt className="text-xs font-semibold uppercase leading-snug tracking-[0.1em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] sm:text-sm md:text-sm lg:text-base">
                    {detail.label}
                  </dt>
                  <dd className="font-display text-sm leading-snug tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_2px_10px_rgba(0,0,0,0.9)] sm:text-base md:text-base lg:text-lg">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const slides = useMemo(
    () => (banners.length > 0 ? banners : DEFAULT_BANNERS),
    [banners],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pointerStartXRef = useRef<number | null>(null);
  const pointerStartYRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);
  const slideCount = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) {
        return;
      }

      const normalized =
        ((index % slideCount) + slideCount) % slideCount;
      setActiveIndex(normalized);
    },
    [slideCount],
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(goNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, slideCount]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    const startX = pointerStartXRef.current;
    const startY = pointerStartYRef.current;
    pointerStartXRef.current = null;
    pointerStartYRef.current = null;

    if (startX === null || startY === null) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    suppressClickUntilRef.current = Date.now() + 400;

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrev();
  };

  const onPointerCancel = () => {
    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
  };

  const onCarouselClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (Date.now() < suppressClickUntilRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (slideCount === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="hero-carousel relative w-full overflow-hidden"
        role="region"
        aria-roledescription="Carrusel"
        aria-label="Productos destacados"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        tabIndex={0}
      >
        <div
          className="relative aspect-[5/2] min-h-[15rem] max-h-[34rem] w-full touch-pan-y bg-panel/40"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={onCarouselClickCapture}
        >
          <div
            className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            aria-live="polite"
          >
            {slides.map((banner, index) => (
              <div
                key={`${banner.productId || "default"}-${index}`}
                className="h-full w-full shrink-0"
              >
                <HeroCarouselSlide
                  banner={banner}
                  priority={index === 0}
                  loadImage={shouldLoadSlideImage(index, activeIndex, slideCount)}
                />
              </div>
            ))}
          </div>

          {slideCount > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                className="absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 md:flex sm:left-5 sm:h-11 sm:w-11"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 md:flex sm:right-5 sm:h-11 sm:w-11"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </button>

              <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-2 backdrop-blur-sm sm:bottom-5 md:bottom-[7.25rem]">
                {slides.map((banner, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`${banner.productId || "default"}-dot-${index}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goTo(index);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        isActive ? "w-5 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Ir al slide ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="rivet-divider relative py-8">
          <span />
        </div>
      </div>
    </section>
  );
}
