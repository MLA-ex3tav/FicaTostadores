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
      <p className="text-xs uppercase tracking-widest text-steel-mid">
        {products.length === 1
          ? "1 producto en cotización"
          : `${products.length} productos en cotización`}
      </p>

      <ul className="mt-3 space-y-2">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-start justify-between gap-2 rounded-md border border-steel-dark/30 bg-background/50 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-sm tracking-wide text-steel-light">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs text-orange">{product.capacity}</p>
            </div>
            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="shrink-0 rounded-md p-1 text-steel-mid transition-colors hover:bg-steel-dark/30 hover:text-orange"
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
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-orange px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
        >
          Ir a cotizar
        </Link>
      )}
    </div>
  );
}
