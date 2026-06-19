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

function HeroCarouselSlide({
  banner,
  priority,
}: {
  banner: HeroProductBanner;
  priority: boolean;
}) {
  const [headlineTop, headlineBottom] = splitHeadline(banner.name);
  const href = banner.productId ? `/productos/${banner.productId}` : "/productos";
  const hasImage = banner.src.length > 0;

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
          quality={90}
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
        className="absolute inset-y-0 right-0 z-[1] w-[48%] bg-gradient-to-l from-black/85 via-black/50 to-transparent"
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

      <div className="pointer-events-none absolute inset-0 z-[3] flex h-full items-end px-5 pb-14 pt-8 sm:px-8 md:px-12 lg:px-16">
        {/* Mobile: solo título */}
        <div className="max-w-[85%] md:hidden">
          <p className="font-display text-lg leading-tight tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_4px_16px_rgba(0,0,0,0.9)] sm:text-xl">
            {banner.name.toUpperCase()}
          </p>
        </div>

        {/* Desktop: izquierda título · derecha especificaciones */}
        <div className="hidden h-full w-full md:flex md:justify-between md:gap-6">
          <div className="flex w-1/2 flex-col justify-end gap-3 pr-4">
            <div>
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
            </div>

            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
              Click para ver más info →
            </p>
          </div>

          {banner.technicalDetails.length > 0 ? (
            <div className="flex h-full w-1/2 shrink-0 flex-col justify-between py-8 text-right">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">
                Especificaciones
              </p>
              <dl className="flex flex-1 flex-col justify-between py-4">
                {banner.technicalDetails.map((detail, index) => (
                  <div key={detail.label} className="py-2">
                    <dt className="text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.14em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] sm:text-xs">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 font-display text-[clamp(0.7rem,1.2vw,0.95rem)] leading-none tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_2px_10px_rgba(0,0,0,0.9)]">
                      {detail.value}
                    </dd>
                    {index < banner.technicalDetails.length - 1 ? (
                      <div
                        className="ml-auto mt-2 h-px w-16 bg-white/30 sm:w-20"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
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
    if (event.target !== event.currentTarget) {
      return;
    }
    pointerStartXRef.current = event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      pointerStartXRef.current = null;
      return;
    }

    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;

    if (startX === null) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrev();
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
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        tabIndex={0}
      >
        <div className="relative aspect-[5/2] min-h-[15rem] max-h-[34rem] w-full bg-panel/40">
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
                <HeroCarouselSlide banner={banner} priority={index === 0} />
              </div>
            ))}
          </div>

          {slideCount > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:left-5 sm:h-11 sm:w-11"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:right-5 sm:h-11 sm:w-11"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </button>

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm">
                {slides.map((banner, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`${banner.productId || "default"}-dot-${index}`}
                      type="button"
                      onClick={() => goTo(index)}
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
