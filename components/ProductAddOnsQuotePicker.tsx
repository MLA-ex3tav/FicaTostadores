"use client";

import { useEffect, useState } from "react";
import type { ProductAddOn } from "@/lib/products";
import { buildQuoteProductItem } from "@/lib/quote-product";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteAddOnSelector from "./QuoteAddOnSelector";

interface ProductAddOnsQuotePickerProps {
  productId: string;
  productName: string;
  productCapacity: string;
  addOns: ProductAddOn[];
  selectedColorId: string;
  selectedColor?: string | null;
}

export default function ProductAddOnsQuotePicker({
  productId,
  productName,
  productCapacity,
  addOns,
  selectedColorId,
  selectedColor,
}: ProductAddOnsQuotePickerProps) {
  const { hasProduct, products, addProduct } = useQuoteSelection();
  const inQuote = hasProduct(productId);
  const existing = products.find((product) => product.id === productId);
  const syncedIds =
    existing?.selectedAddOns?.map((addOn) => addOn.id).join("|") ?? "";
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!inQuote) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      existing?.selectedAddOns?.map((addOn) => addOn.id) ?? [],
    );
  }, [productId, inQuote, syncedIds, existing?.selectedAddOns]);

  if (addOns.length === 0) {
    return null;
  }

  function handleChange(ids: string[]) {
    setSelectedIds(ids);
    addProduct(
      buildQuoteProductItem(
        {
          id: productId,
          name: productName,
          capacity: productCapacity,
          addOns,
        },
        ids,
        { id: selectedColorId, name: selectedColor },
      ),
    );
  }

  return (
    <QuoteAddOnSelector
      addOns={addOns}
      selectedIds={selectedIds}
      onChange={handleChange}
      className="mt-5"
    />
  );
}
