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
import ProductPrice from "./ProductPrice";
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

  const primaryImage = images[0];
  const secondaryImages = images.slice(1);

  return (
    <SteelPanel
      unpadded
      className={`mb-10 overflow-hidden ${isSelected ? quoteSelectedPanelClass : ""}`}
    >
      <div className="grid md:grid-cols-2 md:items-stretch">
        <div className="flex min-w-0 flex-col overflow-hidden md:h-full">
          <div className="relative aspect-[3/2] min-h-[14rem] overflow-hidden md:aspect-auto md:min-h-[18rem] md:flex-1">
            {primaryImage ? (
              <MediaImage
                src={primaryImage.src}
                alt={product.name}
                className="h-full w-full"
                fallbackClassName="h-full w-full"
                priority
                objectPosition={focusToObjectPosition(
                  primaryImage.image.product.focus,
                )}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full min-h-[14rem] items-center justify-center bg-background/40 md:min-h-[18rem]">
                <Factory className="h-16 w-16 text-orange" strokeWidth={1.75} />
              </div>
            )}
          </div>

          {secondaryImages.length > 0 && (
            <div className="grid shrink-0 grid-cols-4 gap-px bg-steel-dark/20 md:grid-cols-3">
              {secondaryImages.map(({ image, index, src }) => (
                <div
                  key={`${product.id}-image-${index}`}
                  className="relative aspect-square overflow-hidden bg-panel"
                >
                  <MediaImage
                    src={src}
                    alt={`${product.name} — imagen ${index + 1}`}
                    className="h-full w-full"
                    fallbackClassName="h-full w-full"
                    objectPosition={focusToObjectPosition(image.product.focus)}
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 flex min-w-0 flex-col p-6 md:p-8 lg:p-10">
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
          <h1 className="mt-2 font-display text-4xl tracking-wide text-steel-light lg:text-5xl">
            {product.name}
          </h1>
          <ProductPrice
            amount={product.listPrice}
            size="lg"
            className="mt-3"
            suffix="IVA no incl."
          />
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
