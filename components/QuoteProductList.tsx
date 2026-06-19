"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useQuoteSelection } from "@/lib/quote-selection";

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

  return (
    <div className={className}>
      <div className="shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-orange">
          Cotización
        </p>
        <p className="mt-0.5 text-[11px] text-steel-dark">
          {products.length}{" "}
          {products.length === 1 ? "producto seleccionado" : "productos seleccionados"}
        </p>
      </div>

      <ul className="mt-2 min-h-0 flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-steel-light">{product.name}</p>
              <p className="mt-0.5 text-xs text-steel-dark">{product.capacity}</p>
              {product.selectedAddOns && product.selectedAddOns.length > 0 ? (
                <p className="mt-1 text-xs text-orange/80">
                  + {product.selectedAddOns.map((addOn) => addOn.name).join(", ")}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="shrink-0 p-0.5 text-steel-dark transition-colors hover:text-orange"
              aria-label={`Quitar ${product.name} de la cotización`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {showCta && (
        <Link
          href="/contacto"
          className="mt-3 block w-full shrink-0 border border-white/[0.08] py-2 text-center text-xs text-steel-mid transition-colors hover:border-orange/40 hover:text-orange"
        >
          Ir a cotizar
        </Link>
      )}
    </div>
  );
}
