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
        <div className="mr-3 flex max-h-[min(70vh,32rem)] flex-col rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4 shadow-lg">
          <p className="text-[11px] text-steel-dark">
            {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </p>

          <ul className="mt-2 flex-1 divide-y divide-white/[0.06] overflow-y-auto">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-steel-light">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-steel-dark">
                    {product.capacity}
                  </p>
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

          <Link
            href="/contacto"
            className="mt-3 flex w-full shrink-0 items-center justify-center border border-white/[0.08] py-2.5 text-xs text-steel-mid transition-colors hover:border-orange/40 hover:text-orange"
          >
            Ir a cotizar
          </Link>
        </div>
      </aside>
    </div>
  );
}
