"use client";

import { Factory } from "lucide-react";
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

  return (
    <SteelPanel className={`mb-10 ${isSelected ? quoteSelectedPanelClass : ""}`}>
      {images.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map(({ image, index, src }) => (
            <div
              key={`${product.id}-image-${index}`}
              className="relative h-48 overflow-hidden rounded-lg border border-steel-dark/30"
            >
              <MediaImage
                src={src}
                alt={`${product.name} — imagen ${index + 1}`}
                className="h-48 w-full"
                fallbackClassName="h-48 w-full"
                priority={index === 0}
                objectPosition={focusToObjectPosition(image.product.focus)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-4">
        {images.length === 0 && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-steel-dark/40 bg-background/40">
            <Factory className="h-6 w-6 text-orange" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm uppercase tracking-widest text-steel-dark">
              {getCatalogLabel(product.catalog, catalogConfig)}
              {showCategory && (
                <> · {getCategoryLabel(product.category, catalogConfig)}</>
              )}
            </p>
            {isSelected && <QuoteSelectedLabel />}
          </div>
          <p className="mt-1 text-sm uppercase tracking-widest text-orange">
            {product.capacity}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
            {product.name}
          </h1>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.specs.map((spec, index) => (
              <li
                key={`${product.id}-spec-${index}`}
                className="rounded-md border border-steel-dark/40 px-2.5 py-1 text-sm text-steel-mid"
              >
                {spec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SteelPanel>
  );
}
