"use client";

import { useEffect, useState } from "react";
import type { ProductAddOn } from "@/lib/products";
import { buildQuoteProductItem } from "@/lib/quote-pricing";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteAddOnSelector from "./QuoteAddOnSelector";

interface ProductAddOnsQuotePickerProps {
  productId: string;
  productName: string;
  productCapacity: string;
  listPrice?: number | null;
  addOns: ProductAddOn[];
}

export default function ProductAddOnsQuotePicker({
  productId,
  productName,
  productCapacity,
  listPrice,
  addOns,
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
          listPrice: listPrice ?? null,
          addOns,
        },
        ids,
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
