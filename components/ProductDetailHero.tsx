"use client";

import { Factory } from "lucide-react";
import { getCatalogLabel } from "@/lib/product-catalogs";
import { getCategoryLabel } from "@/lib/product-categories";
import type { Product } from "@/lib/products";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteSelectedLabel, { quoteSelectedPanelClass } from "./QuoteSelectedBadge";
import SteelPanel from "./SteelPanel";

interface ProductDetailHeroProps {
  product: Product;
}

export default function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const { hasProduct } = useQuoteSelection();
  const isSelected = hasProduct(product.id);

  return (
    <SteelPanel className={`mb-10 ${isSelected ? quoteSelectedPanelClass : ""}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-steel-dark/40 bg-background/40">
          <Factory className="h-6 w-6 text-orange" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs uppercase tracking-widest text-steel-dark">
              {getCatalogLabel(product.catalog)}
              {product.catalog === "frutos" && (
                <> · {getCategoryLabel(product.category)}</>
              )}
            </p>
            {isSelected && <QuoteSelectedLabel />}
          </div>
          <p className="mt-1 text-xs uppercase tracking-widest text-orange">
            {product.capacity}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
            {product.name}
          </h1>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.specs.map((spec, index) => (
              <li
                key={`${product.id}-spec-${index}`}
                className="rounded-md border border-steel-dark/40 px-2.5 py-1 text-xs text-steel-mid"
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
