"use client";

import Link from "next/link";
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
import MediaImage from "./MediaImage";
import ProductPlaceholder from "./ProductPlaceholder";
import ProductPrice from "./ProductPrice";
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
  const primaryImageSrc = getProductImageSrc(primaryImage);

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
        <div className="relative -mx-6 -mt-6 mb-4 h-44 overflow-hidden rounded-t-xl md:-mx-8 md:-mt-8">
          {primaryImageSrc ? (
            <MediaImage
              src={primaryImageSrc}
              alt={product.name}
              className="h-44 w-full rounded-t-xl"
              fallbackClassName="h-44 w-full rounded-t-xl"
              objectPosition={focusToObjectPosition(
                primaryImage?.product.focus ?? DEFAULT_IMAGE_FOCUS,
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          ) : (
            <ProductPlaceholder className="h-44 w-full rounded-t-xl" />
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
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
            </div>
            {isSelected && <QuoteSelectedLabel className="shrink-0 pt-0.5" />}
          </div>
          <h3 className="font-display text-2xl tracking-wide text-steel-light transition-colors group-hover:text-orange">
            {product.name}
          </h3>
          <ProductPrice
            amount={product.listPrice}
            size="md"
            className="mt-2"
            suffix="IVA no incl."
          />
          <p className="mt-3 flex-1 text-base leading-relaxed text-steel-mid">
            {product.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.specs.map((spec, index) => (
              <li
                key={`${product.id}-spec-${index}`}
                className="rounded-md border border-steel-dark/40 px-2 py-0.5 text-sm text-steel-mid"
              >
                {spec}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-orange/60 py-2.5 text-base uppercase tracking-wider text-orange transition-colors group-hover:bg-orange group-hover:text-white">
            Ver ficha técnica
          </span>
        </div>
      </SteelPanel>
    </Link>
  );
}
