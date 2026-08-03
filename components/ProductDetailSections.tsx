"use client";

import type { CatalogConfig } from "@/lib/catalog-config";
import {
  DEFAULT_PRODUCT_COLOR_ID,
  getProductColorLabel,
} from "@/lib/product-colors";
import type { Product } from "@/lib/products";
import { buildQuoteProductItem } from "@/lib/quote-product";
import { useQuoteSelection } from "@/lib/quote-selection";
import { useCallback, useEffect, useState } from "react";
import ProductAddOnsQuotePicker from "@/components/ProductAddOnsQuotePicker";
import ProductColorSection from "@/components/ProductColorSection";
import ProductDetailContent from "@/components/ProductDetailContent";
import ProductDetailHero from "@/components/ProductDetailHero";
import ProductQuoteActions from "@/components/ProductQuoteActions";
import SectionLabel from "@/components/SectionLabel";

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

  const [selectedColorId, setSelectedColorId] = useState(
    () => existingQuoteLine?.selectedColorId ?? DEFAULT_PRODUCT_COLOR_ID,
  );

  useEffect(() => {
    if (existingQuoteLine?.selectedColorId) {
      setSelectedColorId(existingQuoteLine.selectedColorId);
    }
  }, [existingQuoteLine?.selectedColorId]);

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
        buildQuoteProductItem(
          product,
          addOnIds,
          {
            id: nextColorId,
            name: getProductColorLabel(nextColorId),
          },
        ),
      );
    },
    [addProduct, hasProduct, product, products],
  );

  function handleColorChange(nextColorId: string) {
    setSelectedColorId(nextColorId);
    syncQuoteColor(nextColorId);
  }

  return (
    <>
      <ProductDetailHero product={product} catalogConfig={catalogConfig} />

      <ProductColorSection
        selectedColorId={selectedColorId}
        onColorChange={handleColorChange}
      />

      <ProductDetailContent product={product} />

      {product.addOns.length > 0 && (
        <section className="mt-20">
          <SectionLabel>
            Agregados y <span className="text-orange">opciones</span>
          </SectionLabel>
          <ProductAddOnsQuotePicker
            productId={product.id}
            productName={product.name}
            productCapacity={product.capacity}
            addOns={product.addOns}
            selectedColorId={selectedColorId}
            selectedColor={selectedColorName}
          />
        </section>
      )}

      <ProductQuoteActions
        productId={product.id}
        productName={product.name}
        productCapacity={product.capacity}
        addOns={product.addOns}
        selectedColorId={selectedColorId}
        selectedColor={selectedColorName}
      />
    </>
  );
}
