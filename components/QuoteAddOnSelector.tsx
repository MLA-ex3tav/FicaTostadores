"use client";

import type { ProductAddOn } from "@/lib/products";
import AddOnSelectCard from "./AddOnSelectCard";

interface QuoteAddOnSelectorProps {
  addOns: ProductAddOn[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export default function QuoteAddOnSelector({
  addOns,
  selectedIds,
  onChange,
  className = "",
  disabled = false,
}: QuoteAddOnSelectorProps) {
  if (addOns.length === 0) {
    return null;
  }

  function toggleAddOn(id: string) {
    if (disabled) {
      return;
    }

    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }

    onChange([...selectedIds, id]);
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/[0.08] ${className}`}
      role="group"
      aria-label="Agregados opcionales"
    >
      {addOns.map((addOn, index) => (
        <AddOnSelectCard
          key={addOn.id}
          addOn={addOn}
          selected={selectedIds.includes(addOn.id)}
          disabled={disabled}
          isLast={index === addOns.length - 1}
          onToggle={toggleAddOn}
        />
      ))}
    </div>
  );
}
