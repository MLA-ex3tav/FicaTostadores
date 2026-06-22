"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
const TAP_THRESHOLD_PX = 10;

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
    <div className="relative h-full w-full shrink-0 cursor-pointer overflow-hidden">
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

      <div className="pointer-events-none absolute inset-0 z-[2] flex h-full flex-col justify-end">
        {/* Mobile: título */}
        <div className="max-w-[90%] px-5 pb-14 pt-8 sm:px-8 md:hidden">
          <p className="font-display text-xl leading-tight tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1),0_4px_16px_rgba(0,0,0,0.9)] sm:text-2xl">
            {banner.name.toUpperCase()}
          </p>
          <Link
            href={href}
            className="pointer-events-auto mt-3 inline-block text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)] hover:text-orange/90"
            onClick={(event) => event.stopPropagation()}
          >
            Ver producto →
          </Link>
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
              <Link
                href={href}
                className="pointer-events-auto mt-3 inline-block text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-orange drop-shadow-[0_1px_4px_rgba(0,0,0,1)] hover:text-orange/90"
                onClick={(event) => event.stopPropagation()}
              >
                Click para ver más info →
              </Link>
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

      const normalized =
        ((index % slideCount) + slideCount) % slideCount;
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

      return;
    }

    if (absDeltaX <= TAP_THRESHOLD_PX && absDeltaY <= TAP_THRESHOLD_PX) {
      router.push(getSlideHref(slides[realActiveIndex]));
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
                  <HeroCarouselSlide
                    banner={banner}
                    priority={index === 1}
                  />
                </div>
              ))}
            </div>

            {slideCount > 1 ? (
              <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-2 backdrop-blur-sm sm:bottom-5 md:bottom-[7.25rem]">
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
                        isActive ? "w-5 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Ir al slide ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    />
                  );
                })}
              </div>
            ) : null}
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
                className="absolute left-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 md:flex sm:left-5"
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
                className="absolute right-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 md:flex sm:right-5"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
              </button>
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
