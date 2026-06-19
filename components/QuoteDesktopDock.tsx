"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteProductList from "./QuoteProductList";

const panelEase = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function QuoteDesktopDock() {
  const { products } = useQuoteSelection();
  const [open, setOpen] = useState(false);

  if (products.length === 0) {
    return null;
  }

  const productLabel =
    products.length === 1 ? "1 producto" : `${products.length} productos`;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:flex md:flex-col md:items-end md:gap-2">
      <aside
        className={`w-80 max-h-[min(60vh,28rem)] overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--input-bg)] shadow-lg motion-reduce:transition-none ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
        style={{
          transition: `transform 0.35s ${panelEase}, opacity 0.3s ease`,
        }}
        aria-hidden={!open}
      >
        <div className="flex max-h-[min(60vh,28rem)] flex-col px-4 py-4">
          <QuoteProductList
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            showCta={false}
          />
        </div>
      </aside>

      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-3 py-2 shadow-lg">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:text-orange"
          aria-expanded={open}
          aria-label={
            open ? "Contraer lista de cotización" : "Expandir lista de cotización"
          }
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange">
            Cotización
          </span>
          <span className="text-[11px] font-medium text-steel-light">
            {productLabel}
          </span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-steel-mid" strokeWidth={2.25} />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-steel-mid" strokeWidth={2.25} />
          )}
        </button>

        <span className="h-4 w-px bg-white/[0.08]" aria-hidden="true" />

        <Link
          href="/contacto"
          className="shrink-0 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange/40 hover:text-orange"
        >
          Cotizar
        </Link>
      </div>
    </div>
  );
}
