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
          "relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border border-transparent bg-panel p-6 transition-colors duration-200 md:p-8",
          "group-hover:border-orange",
          isSelected && quoteSelectedPanelClass,
        )}
      >
        {isSelected ? (
          <QuoteSelectedLabel className="absolute right-4 top-4 z-10 md:right-6 md:top-6" />
        ) : null}

        <div className="relative -mx-6 -mt-6 mb-4 h-44 overflow-hidden rounded-t-xl bg-surface md:-mx-8 md:-mt-8">
          {primaryImageSrc ? (
            <MediaImage
              src={primaryImageSrc}
              alt={product.name}
              className="h-44 w-full rounded-t-xl transition-transform duration-500 group-hover:scale-[1.02]"
              fallbackClassName="h-44 w-full rounded-t-xl"
              objectPosition={focusToObjectPosition(
                primaryImage?.product.focus ?? DEFAULT_IMAGE_FOCUS,
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          ) : (
            <ProductPlaceholder flat className="h-44 w-full rounded-t-xl" />
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-widest text-steel-dark">
              {getCatalogLabel(product.catalog, catalogConfig)}
              {showCategory && (
                <> · {getCategoryLabel(product.category, catalogConfig)}</>
              )}
            </p>
            <p className="text-sm uppercase tracking-widest text-orange">
              {product.capacity}
            </p>
          </div>

          <h3 className="font-display text-2xl tracking-wide text-steel-light transition-colors group-hover:text-orange">
            {product.name}
          </h3>

          <p className="mt-3 flex-1 text-base leading-relaxed text-steel-mid">
            {product.description}
          </p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {product.specs.map((spec, index) => (
              <li key={`${product.id}-spec-${index}`}>
                <Badge
                  variant="outline"
                  className="rounded-md border-steel-dark/35 bg-transparent px-2 py-0.5 text-xs font-normal text-steel-mid"
                >
                  {spec}
                </Badge>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-5">
            <span className="inline-flex items-center gap-1.5 text-sm text-steel-dark transition-colors group-hover:text-orange">
              <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span>Ver ficha técnica</span>
              <ArrowUpRight
                className="h-3 w-3 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
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
