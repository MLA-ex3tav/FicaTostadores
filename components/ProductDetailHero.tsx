"use client";

import { useState } from "react";
import { Factory } from "lucide-react";
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
import QuoteSelectedLabel, { quoteSelectedPanelClass } from "./QuoteSelectedBadge";
import SteelPanel from "./SteelPanel";

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
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: motionDuration.slow, ease: motionEase }}
    >
      <SteelPanel
        unpadded
        className={`mb-10 overflow-hidden ${isSelected ? quoteSelectedPanelClass : ""}`}
      >
        <div className="grid md:grid-cols-2 md:items-stretch">
          {/* ── Galería ── */}
          <div className="flex min-w-0 flex-col overflow-hidden md:h-full">
            <div className="img-zoom-hover relative aspect-[3/2] min-h-[14rem] overflow-hidden md:aspect-auto md:min-h-[22rem] md:flex-1">
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full min-h-[14rem] items-center justify-center bg-background/40 md:min-h-[22rem]">
                  <Factory className="h-16 w-16 text-orange" strokeWidth={1.75} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid shrink-0 auto-cols-fr grid-flow-col gap-px bg-steel-dark/20">
                {images.map(({ image, index, src }) => (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative aspect-square overflow-hidden bg-panel transition-all duration-200 cursor-pointer ${
                      index === activeIndex
                        ? "opacity-100 ring-2 ring-inset ring-orange"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
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
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="relative z-10 flex min-w-0 flex-col p-6 md:p-8 lg:p-10">
            {isSelected ? (
              <QuoteSelectedLabel className="absolute right-6 top-6 md:right-8 md:top-8" />
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionDuration.base, ease: motionEase, delay: 0.15 }}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm uppercase tracking-widest text-steel-dark">
                  {getCatalogLabel(product.catalog, catalogConfig)}
                  {showCategory && (
                    <> · {getCategoryLabel(product.category, catalogConfig)}</>
                  )}
                </p>
              </div>

              <p className="mt-1 text-sm uppercase tracking-widest text-orange">
                {product.capacity}
              </p>
            </motion.div>

            <motion.h1
              className="mt-2 font-display text-4xl tracking-wide text-steel-light lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionDuration.base, ease: motionEase, delay: 0.25 }}
            >
              {product.name}
            </motion.h1>

            <motion.p
              className="mt-4 text-base leading-relaxed text-steel-mid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionDuration.base, ease: motionEase, delay: 0.35 }}
            >
              {product.description}
            </motion.p>

            <motion.ul
              className="mt-5 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionDuration.base, ease: motionEase, delay: 0.45 }}
            >
              {product.specs.map((spec, index) => (
                <li
                  key={`${product.id}-spec-${index}`}
                  className="spec-badge rounded-md border border-steel-dark/40 px-2.5 py-1 text-sm text-steel-mid"
                >
                  {spec}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </SteelPanel>
    </motion.div>
  );
}
