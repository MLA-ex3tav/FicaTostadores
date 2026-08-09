"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from "react";
import MediaImage from "./MediaImage";
import PromoBadge from "./PromoBadge";
import type { HeroProductBanner } from "@/lib/images";
import {
  CAROUSEL_CONTAINER_CLASS,
  CAROUSEL_DEFAULT_FOCUS,
  focusToObjectPosition,
} from "@/lib/product-images";

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
    carouselFocus: CAROUSEL_DEFAULT_FOCUS,
  },
];

function getRealSlideIndex(trackIndex: number, slideCount: number): number {
  if (slideCount <= 1) {
    return 0;
  }

  if (trackIndex === 0) {
    return slideCount - 1;
  }

  if (trackIndex >= slideCount + 1) {
    return 0;
  }

  return trackIndex - 1;
}

function buildLoopSlides(slides: HeroProductBanner[]): HeroProductBanner[] {
  if (slides.length <= 1) {
    return slides;
  }

  const first = slides[0];
  const last = slides[slides.length - 1];
  return [last, ...slides, first];
}

function HeroBannerSlide({
  banner,
  priority,
}: {
  banner: HeroProductBanner;
  priority: boolean;
}) {
  const href = banner.productId
    ? `/productos/${banner.productId}`
    : "/productos";
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
          quality={80}
        />
      ) : (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#2a3038] via-[#1a1d22] to-[#0f1114]"
          aria-hidden="true"
        />
      )}

      {/* Overlay sutil: prioriza el lado del contenido */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/40 to-background/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 z-[1] w-1/2 bg-gradient-to-l from-background/50 to-transparent md:w-1/3"
        aria-hidden="true"
      />

      {banner.isPromo ? (
        <PromoBadge
          label={banner.promoTag}
          size="lg"
          className="absolute right-4 top-4 z-[3] sm:right-8 sm:top-8"
        />
      ) : null}

      {/* Contenido */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-[1550px] px-4 md:px-8 lg:px-12">
          <div className="max-w-xl">
            {/* Mobile */}
            <div className="md:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange">
                {banner.catalogLabel}
                {banner.categoryLabel ? ` · ${banner.categoryLabel}` : null}
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight tracking-wide text-white">
                {banner.name.toUpperCase()}
              </h2>
              {banner.description ? (
                <p className="mt-3 text-sm leading-relaxed text-white/90 line-clamp-3">
                  {banner.description}
                </p>
              ) : null}
              <Link
                href={href}
                className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                onClick={(event) => event.stopPropagation()}
              >
                Ver producto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Desktop: panel glass lateral */}
            <div className="hidden md:block">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-8 backdrop-blur-md lg:p-10">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange">
                  <span className="h-px w-6 bg-orange" aria-hidden="true" />
                  {banner.catalogLabel}
                  {banner.categoryLabel ? ` · ${banner.categoryLabel}` : null}
                </p>
                <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-wide text-white lg:text-5xl">
                  {banner.name.toUpperCase()}
                </h2>
                {banner.capacity ? (
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                    {banner.capacity}
                  </p>
                ) : null}
                {banner.description ? (
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/85">
                    {banner.description}
                  </p>
                ) : null}
                <Link
                  href={href}
                  className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                  onClick={(event) => event.stopPropagation()}
                >
                  Ver producto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
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
  const loopSlides = useMemo(() => buildLoopSlides(slides), [slides]);
  const slideCount = slides.length;
  const loopSlideCount = loopSlides.length;
  const [trackIndex, setTrackIndex] = useState(slideCount > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const pointerStartXRef = useRef<number | null>(null);
  const pointerStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const isBusyRef = useRef(false);
  const realActiveIndex = getRealSlideIndex(trackIndex, slideCount);
  const slideWidthPercent = loopSlideCount > 0 ? 100 / loopSlideCount : 100;

  useEffect(() => {
    setTrackIndex(slideCount > 1 ? 1 : 0);
    setTransitionEnabled(true);
    isBusyRef.current = false;
  }, [slideCount]);

  useLayoutEffect(() => {
    if (transitionEnabled) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        isBusyRef.current = false;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [transitionEnabled, trackIndex]);

  const releaseBusyIfNeeded = useCallback(
    (index: number) => {
      if (slideCount <= 1) {
        isBusyRef.current = false;
        return;
      }

      if (index > 0 && index < slideCount + 1) {
        isBusyRef.current = false;
      }
    },
    [slideCount],
  );

  const getSlideHref = useCallback((banner: HeroProductBanner) => {
    return banner.productId ? `/productos/${banner.productId}` : "/productos";
  }, []);

  const goToRealIndex = useCallback(
    (index: number) => {
      if (slideCount <= 1 || isBusyRef.current) {
        return;
      }

      const normalized = ((index % slideCount) + slideCount) % slideCount;
      isBusyRef.current = true;
      setTransitionEnabled(true);
      setTrackIndex(normalized + 1);
    },
    [slideCount],
  );

  const goNext = useCallback(() => {
    if (slideCount <= 1 || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex((current) => Math.min(current + 1, slideCount + 1));
  }, [slideCount]);

  const goPrev = useCallback(() => {
    if (slideCount <= 1 || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex((current) => Math.max(current - 1, 0));
  }, [slideCount]);

  const onTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      slideCount <= 1
    ) {
      return;
    }

    if (trackIndex <= 0) {
      setTransitionEnabled(false);
      setTrackIndex(slideCount);
      return;
    }

    if (trackIndex >= slideCount + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
      return;
    }

    releaseBusyIfNeeded(trackIndex);
  };

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
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      const target = event.target as HTMLElement;
      if (target.closest("button, a")) {
        return;
      }

      event.preventDefault();
      router.push(getSlideHref(slides[realActiveIndex]));
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    didSwipeRef.current = false;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) {
      pointerStartXRef.current = null;
      pointerStartYRef.current = null;
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
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX >= SWIPE_THRESHOLD_PX && absDeltaX > absDeltaY) {
      didSwipeRef.current = true;

      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const onPointerCancel = () => {
    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    didSwipeRef.current = false;
  };

  const onCarouselClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (didSwipeRef.current) {
      event.preventDefault();
      event.stopPropagation();
      didSwipeRef.current = false;
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
        <div className={`${CAROUSEL_CONTAINER_CLASS} bg-panel/40`}>
          <div
            className="absolute inset-0 touch-pan-y overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClickCapture={onCarouselClickCapture}
          >
            <div
              className={`flex h-full ${
                transitionEnabled
                  ? "transition-transform duration-700 ease-out motion-reduce:transition-none"
                  : ""
              }`}
              style={{
                width: `${loopSlideCount * 100}%`,
                transform: `translateX(-${trackIndex * slideWidthPercent}%)`,
              }}
              onTransitionEnd={onTrackTransitionEnd}
              aria-live="polite"
            >
              {loopSlides.map((banner, index) => (
                <div
                  key={`${banner.productId || "default"}-loop-${index}`}
                  className="h-full shrink-0"
                  style={{ width: `${slideWidthPercent}%` }}
                >
                  <HeroBannerSlide banner={banner} priority={index === 1} />
                </div>
              ))}
            </div>
          </div>

          {slideCount > 1 ? (
            <>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-orange/60 hover:text-orange md:flex"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-orange/60 hover:text-orange md:flex"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
              </button>

              <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm">
                {slides.map((banner, index) => {
                  const isActive = index === realActiveIndex;
                  return (
                    <button
                      key={`${banner.productId || "default"}-dot-${index}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToRealIndex(index);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? "w-6 bg-orange"
                          : "w-2 bg-white/40 hover:bg-white/70"
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
    </section>
  );
}
