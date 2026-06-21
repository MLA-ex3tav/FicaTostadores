"use client";

import { Check } from "lucide-react";
import type { ProductAddOn } from "@/lib/products";
import { formatClpPrice, hasValidListPrice } from "@/lib/pricing";

interface AddOnSelectCardProps {
  addOn: ProductAddOn;
  selected: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onToggle: (id: string) => void;
}

export default function AddOnSelectCard({
  addOn,
  selected,
  disabled = false,
  isLast = false,
  onToggle,
}: AddOnSelectCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onToggle(addOn.id)}
      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 ${
        selected ? "bg-orange/[0.04]" : "hover:bg-white/[0.02]"
      } ${!isLast ? "border-b border-white/[0.06]" : ""}`}
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block text-base font-medium tracking-wide transition-colors ${
            selected ? "text-orange" : "text-steel-light"
          }`}
        >
          {addOn.name}
        </span>
        {addOn.description ? (
          <span className="mt-1 block text-base leading-relaxed text-steel-mid">
            {addOn.description}
          </span>
        ) : null}
        {hasValidListPrice(addOn.price) ? (
          <span className="mt-1.5 block text-sm font-semibold text-orange">
            + {formatClpPrice(addOn.price)}
          </span>
        ) : null}
      </span>
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected
            ? "border-orange bg-orange text-white"
            : "border-steel-dark/40 bg-transparent"
        }`}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
      </span>
    </button>
  );
}
