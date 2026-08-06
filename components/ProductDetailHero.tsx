"use client";

import { useState } from "react";
import { AlertCircle, Factory, Gauge, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCatalogLabel,
  getCategoryLabel,
  shouldShowCategoryForCatalog,
  type CatalogConfig,
} from "@/lib/catalog-config";
import type { Product } from "@/lib/products";
import {
  focusToObjectPosition,
  getProductImageSrc,
} from "@/lib/product-images";
import { useQuoteSelection } from "@/lib/quote-selection";
import { motionDuration, motionEase } from "@/lib/motion";
import MediaImage from "./MediaImage";
import PromoBadge from "./PromoBadge";
import QuoteSelectedLabel, { quoteSelectedPanelClass } from "./QuoteSelectedBadge";

interface ProductDetailHeroProps {
  product: Product;
  catalogConfig: CatalogConfig;
}

export default function ProductDetailHero({
  product,
  catalogConfig,
}: ProductDetailHeroProps) {
  const { hasProduct } = useQuoteSelection();
  const isSelected = hasProduct(product.id);
  const showCategory = shouldShowCategoryForCatalog(
    product.catalog,
    catalogConfig,
  );
  const images = (product.images ?? []).flatMap((image, index) => {
    const src = getProductImageSrc(image);
    return src ? [{ image, index, src }] : [];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration.slow, ease: motionEase }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-panel/80 ${
        isSelected ? quoteSelectedPanelClass : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,93,4,0.08),transparent_55%)]" />

      <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* Gallery */}
        <div className="flex min-w-0 flex-col border-b border-white/[0.06] lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <div className="img-zoom-hover relative aspect-[4/3] overflow-hidden bg-background/50 sm:aspect-[16/11] lg:aspect-auto lg:min-h-[28rem] lg:flex-1">
            {activeImage ? (
              <MediaImage
                key={activeImage.src}
                src={activeImage.src}
                alt={product.name}
                className="h-full w-full"
                fallbackClassName="h-full w-full"
                priority
                objectPosition={focusToObjectPosition(
                  activeImage.image.product.focus,
                )}
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            ) : (
              <div className="flex h-full min-h-[16rem] items-center justify-center lg:min-h-[28rem]">
                <div className="flex flex-col items-center gap-3 text-steel-dark">
                  <Factory className="h-14 w-14 text-orange/80" strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-[0.2em]">
                    Sin imagen
                  </span>
                </div>
              </div>
            )}

            {product.isOutOfStock ? (
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-950/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-300 backdrop-blur-md shadow-lg">
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                Agotado
              </div>
            ) : product.isPromo ? (
              <PromoBadge
                label={product.promoTag}
                size="lg"
                className="absolute left-4 top-4 z-10"
              />
            ) : null}

            {product.capacity ? (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange backdrop-blur-md">
                <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {product.capacity}
              </div>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto p-3 sm:p-4">
              {images.map(({ image, index, src }) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    aria-pressed={active}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:h-18 sm:w-24 ${
                      active
                        ? "border-orange opacity-100 ring-1 ring-orange/40"
                        : "border-white/[0.08] opacity-55 hover:opacity-100"
                    }`}
                  >
                    <MediaImage
                      src={src}
                      alt={`${product.name} — imagen ${index + 1}`}
                      className="h-full w-full"
                      fallbackClassName="h-full w-full"
                      objectPosition={focusToObjectPosition(image.product.focus)}
                      sizes="120px"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="relative flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
          {isSelected ? (
            <QuoteSelectedLabel className="absolute right-5 top-5 sm:right-8 sm:top-8" />
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-background/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-mid">
              {getCatalogLabel(product.catalog, catalogConfig)}
            </span>
            {showCategory ? (
              <span className="rounded-full border border-white/[0.08] bg-background/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-dark">
                {getCategoryLabel(product.category, catalogConfig)}
              </span>
            ) : null}
            {product.isOutOfStock ? (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">
                Agotado
              </span>
            ) : null}
            {product.isPromo ? (
              <PromoBadge
                label={product.promoTag}
                size="sm"
              />
            ) : null}
          </div>

          {product.serie ? (
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-steel-dark">
              {product.serie}
            </p>
          ) : null}

          <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {product.name}
          </h1>

          {product.isPromo && product.promoDescription ? (
            <div className="relative mt-4 overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-orange-600/10 p-4">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-400/20 to-transparent" />
              <p className="font-display text-sm font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="mr-1.5 inline h-4 w-4 animate-pulse" aria-hidden />
                {product.promoTag ? product.promoTag : "Promoción"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-100">
                {product.promoDescription}
              </p>
            </div>
          ) : null}

          <p className="mt-4 max-w-prose text-base leading-relaxed text-steel-mid">
            {product.description}
          </p>

          {product.specs.length > 0 ? (
            <ul className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-2">
              {product.specs.map((spec, index) => (
                <li
                  key={`${product.id}-spec-${index}`}
                  className="rounded-xl border border-white/[0.07] bg-background/35 px-3 py-2.5 text-sm font-medium text-steel-light"
                >
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-steel-dark">
                    Spec {String(index + 1).padStart(2, "0")}
                  </span>
                  {spec}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
