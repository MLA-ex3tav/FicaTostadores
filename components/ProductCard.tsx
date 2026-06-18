"use client";

import Link from "next/link";
import { Factory } from "lucide-react";
import {
  getCatalogLabel,
  getCategoryLabel,
  shouldShowCategoryForCatalog,
  type CatalogConfig,
} from "@/lib/catalog-config";
import type { Product } from "@/lib/products";
import { useQuoteSelection } from "@/lib/quote-selection";
import MediaImage from "./MediaImage";
import QuoteSelectedLabel, { quoteSelectedPanelClass } from "./QuoteSelectedBadge";
import SteelPanel from "./SteelPanel";

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

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group relative block hover:z-10"
    >
      <SteelPanel
        className={`flex h-full flex-col overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] ${
          isSelected ? quoteSelectedPanelClass : ""
        }`}
      >
        {primaryImage ? (
          <div className="relative -mx-5 -mt-5 mb-4 h-44 md:-mx-6 md:-mt-6">
            <MediaImage
              src={primaryImage}
              alt={product.name}
              className="h-44 w-full"
              fallbackClassName="h-44 w-full"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {!primaryImage && (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-steel-dark/40 bg-background/40">
                  <Factory className="h-5 w-5 text-orange" strokeWidth={1.75} />
                </span>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-steel-dark">
                  {getCatalogLabel(product.catalog, catalogConfig)}
                  {showCategory && (
                    <> · {getCategoryLabel(product.category, catalogConfig)}</>
                  )}
                </p>
                <p className="text-xs uppercase tracking-widest text-orange">
                  {product.capacity}
                </p>
              </div>
            </div>
            {isSelected && <QuoteSelectedLabel className="shrink-0 pt-0.5" />}
          </div>
          <h3 className="font-display text-xl tracking-wide text-steel-light transition-colors group-hover:text-orange">
            {product.name}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-steel-mid">
            {product.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.specs.map((spec, index) => (
              <li
                key={`${product.id}-spec-${index}`}
                className="rounded-md border border-steel-dark/40 px-2 py-0.5 text-xs text-steel-mid"
              >
                {spec}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-orange/60 py-2.5 text-sm uppercase tracking-wider text-orange transition-colors group-hover:bg-orange group-hover:text-white">
            Ver ficha técnica
          </span>
        </div>
      </SteelPanel>
    </Link>
  );
}
