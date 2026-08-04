"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import {
  getCatalogLabel,
  getCategoryLabel,
  shouldShowCategoryForCatalog,
  type CatalogConfig,
} from "@/lib/catalog-config";
import type { Product } from "@/lib/products";
import {
  DEFAULT_IMAGE_FOCUS,
  focusToObjectPosition,
  getProductImageSrc,
} from "@/lib/product-images";
import { useQuoteSelection } from "@/lib/quote-selection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MediaImage from "./MediaImage";
import ProductPlaceholder from "./ProductPlaceholder";
import QuoteSelectedLabel, { quoteSelectedPanelClass } from "./QuoteSelectedBadge";

interface ProductCardProps {
  product: Product;
  catalogConfig: CatalogConfig;
}

export default function ProductCard({ product, catalogConfig }: ProductCardProps) {
  const { hasProduct } = useQuoteSelection();
  const isSelected = hasProduct(product.id);
  const showCategory = shouldShowCategoryForCatalog(
    product.catalog,
    catalogConfig,
  );
  const primaryImage = product.images?.[0];
  const primaryImageSrc = getProductImageSrc(primaryImage);

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group relative block h-full hover:z-10"
    >
      <article
        className={cn(
          "relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-steel-dark/20 bg-panel p-6 shadow-xl shadow-black/30 transition-all duration-300 md:p-7",
          "group-hover:-translate-y-1.5 group-hover:border-orange/80 group-hover:shadow-2xl group-hover:shadow-black/60",
          isSelected && quoteSelectedPanelClass,
        )}
      >
        {isSelected ? (
          <QuoteSelectedLabel className="absolute right-4 top-4 z-10 md:right-6 md:top-6" />
        ) : null}

        <div className="relative -mx-6 -mt-6 mb-5 h-56 overflow-hidden rounded-t-2xl bg-surface md:-mx-7 md:-mt-7">
          {primaryImageSrc ? (
            <MediaImage
              src={primaryImageSrc}
              alt={product.name}
              className="h-56 w-full rounded-t-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fallbackClassName="h-56 w-full rounded-t-2xl"
              objectPosition={focusToObjectPosition(
                primaryImage?.product.focus ?? DEFAULT_IMAGE_FOCUS,
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 450px"
            />
          ) : (
            <ProductPlaceholder flat className="h-56 w-full rounded-t-2xl" />
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-steel-dark font-medium">
              {getCatalogLabel(product.catalog, catalogConfig)}
              {showCategory && (
                <> · {getCategoryLabel(product.category, catalogConfig)}</>
              )}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tabular-nums tracking-widest text-orange">
              {product.capacity}
            </p>
          </div>

          <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-steel-light transition-colors group-hover:text-orange">
            {product.name}
          </h3>

          <p className="mt-3 flex-1 text-sm md:text-base leading-relaxed text-steel-mid">
            {product.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {product.specs.map((spec, index) => (
              <li key={`${product.id}-spec-${index}`}>
                <Badge
                  variant="outline"
                  className="rounded-lg border-steel-dark/25 bg-surface/60 px-2.5 py-1 text-xs font-medium text-steel-mid transition-colors group-hover:border-steel-dark/40"
                >
                  {spec}
                </Badge>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-dark transition-colors group-hover:text-orange">
              <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>Ver ficha técnica</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
