"use client";

import { useEffect, useState } from "react";
import type { ProductAddOn } from "@/lib/products";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteAddOnSelector from "./QuoteAddOnSelector";

interface ProductAddOnsQuotePickerProps {
  productId: string;
  productName: string;
  productCapacity: string;
  addOns: ProductAddOn[];
}

function mapSelectedAddOns(addOns: ProductAddOn[], selectedIds: string[]) {
  return addOns
    .filter((addOn) => selectedIds.includes(addOn.id))
    .map((addOn) => ({ id: addOn.id, name: addOn.name }));
}

export default function ProductAddOnsQuotePicker({
  productId,
  productName,
  productCapacity,
  addOns,
}: ProductAddOnsQuotePickerProps) {
  const { hasProduct, products, addProduct, updateProductAddOns } =
    useQuoteSelection();
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
    const selectedAddOns = mapSelectedAddOns(addOns, ids);

    if (inQuote) {
      updateProductAddOns(productId, selectedAddOns);
    } else {
      addProduct({
        id: productId,
        name: productName,
        capacity: productCapacity,
        selectedAddOns,
      });
    }
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
