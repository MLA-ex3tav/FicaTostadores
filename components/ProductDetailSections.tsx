"use client";

import type { CatalogConfig } from "@/lib/catalog-config";
import {
  DEFAULT_PRODUCT_COLOR_ID,
  PRODUCT_COLORS,
  getProductColorLabel,
} from "@/lib/product-colors";
import type { Product } from "@/lib/products";
import { buildQuoteProductItem } from "@/lib/quote-product";
import { useQuoteSelection } from "@/lib/quote-selection";
import { useCallback, useMemo, useState } from "react";
import ProductColorSection from "@/components/ProductColorSection";
import ProductDetailContent from "@/components/ProductDetailContent";
import ProductDetailHero from "@/components/ProductDetailHero";
import ProductQuoteActions from "@/components/ProductQuoteActions";
import Reveal from "@/components/motion/Reveal";

interface ProductDetailSectionsProps {
  product: Product;
  catalogConfig: CatalogConfig;
}

export default function ProductDetailSections({
  product,
  catalogConfig,
}: ProductDetailSectionsProps) {
  const { products, hasProduct, addProduct } = useQuoteSelection();
  const existingQuoteLine = products.find((item) => item.id === product.id);

  const initialDefaultColor = useMemo(() => {
    const disabled = product.disabledColors ?? [];
    if (!disabled.includes(DEFAULT_PRODUCT_COLOR_ID)) {
      return DEFAULT_PRODUCT_COLOR_ID;
    }
    const available = PRODUCT_COLORS.find((c) => !disabled.includes(c.id));
    return available?.id ?? DEFAULT_PRODUCT_COLOR_ID;
  }, [product.disabledColors]);

  const [localColorId, setLocalColorId] = useState<string | null>(null);
  const selectedColorId =
    localColorId ??
    existingQuoteLine?.selectedColorId ??
    initialDefaultColor;
  const selectedColorName = getProductColorLabel(selectedColorId);

  const syncQuoteColor = useCallback(
    (nextColorId: string) => {
      if (!hasProduct(product.id)) {
        return;
      }

      const addOnIds =
        products
          .find((item) => item.id === product.id)
          ?.selectedAddOns?.map((addOn) => addOn.id) ?? [];

      addProduct(
        buildQuoteProductItem(product, addOnIds, {
          id: nextColorId,
          name: getProductColorLabel(nextColorId),
        }),
      );
    },
    [addProduct, hasProduct, product, products],
  );

  function handleColorChange(nextColorId: string) {
    setLocalColorId(nextColorId);
    syncQuoteColor(nextColorId);
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <ProductDetailHero product={product} catalogConfig={catalogConfig} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
        <div className="min-w-0">
          <Reveal delay={0.05}>
            <ProductDetailContent product={product} />
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.08}>
            <div className="space-y-5 border border-white/[0.08] bg-panel/60 p-4 sm:p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel-dark">
                  Cotización
                </p>
                <p className="mt-1 text-sm text-steel-mid">
                  {product.isOutOfStock
                    ? "Este producto no se encuentra disponible actualmente."
                    : "Color, agregados y envío a la lista."}
                </p>
              </div>

              {!product.isOutOfStock ? (
                <ProductColorSection
                  selectedColorId={selectedColorId}
                  onColorChange={handleColorChange}
                  disableColors={product.disableColors}
                  disabledColors={product.disabledColors}
                  compact
                />
              ) : null}

              <ProductQuoteActions
                productId={product.id}
                productName={product.name}
                productCapacity={product.capacity}
                addOns={product.addOns}
                selectedColorId={selectedColorId}
                selectedColor={selectedColorName}
                isOutOfStock={product.isOutOfStock}
                compact
              />
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
