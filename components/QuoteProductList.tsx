"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useQuoteSelection } from "@/lib/quote-selection";

export const quoteEyebrowClass =
  "text-sm font-semibold uppercase tracking-[0.3em] text-orange";

export const quoteCountClass = "text-base text-steel-mid";

interface QuoteProductListProps {
  className?: string;
  showCta?: boolean;
}

export default function QuoteProductList({
  className = "",
  showCta = true,
}: QuoteProductListProps) {
  const { products, removeProduct } = useQuoteSelection();

  if (products.length === 0) {
    return null;
  }

  const countLabel =
    products.length === 1
      ? "1 producto seleccionado"
      : `${products.length} productos seleccionados`;

  return (
    <div className={className}>
      <div className="shrink-0 border-b border-white/[0.08] pb-4">
        <p className={quoteEyebrowClass}>Cotización</p>
        <p className={`mt-1.5 ${quoteCountClass}`}>{countLabel}</p>
      </div>

      <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl tracking-wide text-steel-light">
                {product.name}
              </p>
              <p className="mt-1 text-base text-steel-dark">{product.capacity}</p>
              {product.selectedAddOns && product.selectedAddOns.length > 0 ? (
                <p className="mt-1.5 text-base text-orange/80">
                  + {product.selectedAddOns.map((addOn) => addOn.name).join(", ")}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-steel-dark transition-colors hover:border-orange/40 hover:bg-orange/10 hover:text-orange"
              aria-label={`Quitar ${product.name} de la cotización`}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>

      {showCta && (
        <Link
          href="/contacto"
          className="mt-4 block w-full shrink-0 rounded-xl border border-orange/40 py-3.5 text-center text-base font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange hover:bg-orange/10"
        >
          Ir a cotizar
        </Link>
      )}
    </div>
  );
}
