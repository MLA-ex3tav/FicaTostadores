"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";

const panelEase = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function QuoteDesktopDock() {
  const { products, removeProduct } = useQuoteSelection();
  const [open, setOpen] = useState(false);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 hidden md:block">
      {!open && (
        <div
          className="absolute inset-y-0 right-0 w-1.5"
          onMouseEnter={() => setOpen(true)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed right-0 top-1/2 w-80 -translate-y-1/2 motion-reduce:transition-none ${
          open
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
        style={{
          transition: `transform 0.45s ${panelEase}, opacity 0.35s ease`,
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-hidden={!open}
      >
        <div className="mr-3 flex max-h-[min(70vh,32rem)] flex-col rounded-xl border border-steel-dark/25 bg-panel/95 py-5 pl-5 pr-4 shadow-xl backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.22em] text-steel-dark">
            Cotización
          </p>
          <p className="mt-1 font-display text-lg tracking-wide text-steel-light">
            {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </p>

          <ul className="mt-5 flex-1 space-y-0 overflow-y-auto pr-1">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 border-b border-steel-dark/20 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-display text-base tracking-wide text-steel-light">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm text-orange">{product.capacity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="shrink-0 rounded-md p-1.5 text-steel-dark transition-colors hover:text-orange"
                  aria-label={`Quitar ${product.name} de la cotización`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <Link
            href="/contacto"
            className="mt-5 flex w-full shrink-0 items-center justify-center rounded-xl bg-orange px-5 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
          >
            Ir a cotizar
          </Link>
        </div>
      </aside>
    </div>
  );
}
