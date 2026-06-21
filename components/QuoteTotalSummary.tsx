"use client";

import { computeFinalTotal, isQuotePricingComplete } from "@/lib/quote-pricing";
import { formatClpPrice, hasValidListPrice } from "@/lib/pricing";
import type { QuoteProductItem } from "@/lib/quote-selection";

interface QuoteTotalSummaryProps {
  products: QuoteProductItem[];
  className?: string;
  compact?: boolean;
}

export default function QuoteTotalSummary({
  products,
  className = "",
  compact = false,
}: QuoteTotalSummaryProps) {
  const finalTotal = computeFinalTotal(products);
  const pricingComplete = isQuotePricingComplete(products);

  if (!hasValidListPrice(finalTotal)) {
    return null;
  }

  return (
    <div
      className={`border-t border-white/[0.08] pt-4 ${className}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p
            className={`font-semibold uppercase tracking-[0.2em] text-steel-mid ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            Total estimado
          </p>
          {!pricingComplete ? (
            <p className="mt-1 text-xs text-steel-dark">
              Algunos ítems no tienen precio de lista publicado.
            </p>
          ) : (
            <p className="mt-1 text-xs text-steel-dark">IVA no incluido</p>
          )}
        </div>
        <p
          className={`tracking-wide text-orange ${
            compact
              ? "font-display text-xl"
              : "font-display text-2xl"
          }`}
        >
          {formatClpPrice(finalTotal)}
        </p>
      </div>
    </div>
  );
}

export function QuoteLinePrice({
  lineTotal,
  listPrice,
  selectedAddOns,
  compact = false,
}: Pick<QuoteProductItem, "lineTotal" | "listPrice" | "selectedAddOns"> & {
  compact?: boolean;
}) {
  if (!hasValidListPrice(lineTotal)) {
    return null;
  }

  const pricedAddOns = (selectedAddOns ?? []).filter((addOn) =>
    hasValidListPrice(addOn.price),
  );

  if (compact) {
    return (
      <p className="mt-1.5 text-sm text-orange">
        {formatClpPrice(lineTotal)}
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1 text-sm text-steel-mid">
      {hasValidListPrice(listPrice) ? (
        <p>Equipo: {formatClpPrice(listPrice)}</p>
      ) : null}
      {pricedAddOns.map((addOn) => (
        <p key={addOn.id}>
          + {addOn.name}: {formatClpPrice(addOn.price!)}
        </p>
      ))}
      <p className="font-semibold text-orange">
        Subtotal: {formatClpPrice(lineTotal)}
      </p>
    </div>
  );
}
