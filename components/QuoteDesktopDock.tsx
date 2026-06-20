"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteProductList, {
  quoteCountClass,
  quoteEyebrowClass,
} from "./QuoteProductList";

const dockDuration = "duration-350";

export default function QuoteDesktopDock() {
  const { products } = useQuoteSelection();
  const [open, setOpen] = useState(false);

  if (products.length === 0) {
    return null;
  }

  const productLabel =
    products.length === 1 ? "1 producto" : `${products.length} productos`;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block">
      <div className="w-[22rem] overflow-hidden rounded-2xl border border-white/[0.1] bg-[var(--input-bg)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] motion-reduce:transition-none">
        <div
          className={`grid motion-reduce:transition-none ${dockDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          style={{ transitionProperty: "grid-template-rows" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`flex max-h-[min(60vh,32rem)] flex-col px-5 py-5 transition-opacity motion-reduce:transition-none ${dockDuration} ease-out ${
                open
                  ? "opacity-100 delay-75"
                  : "pointer-events-none opacity-0 delay-0"
              }`}
            >
              <QuoteProductList
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                showCta
                onCollapse={() => setOpen(false)}
              />
            </div>
          </div>
        </div>

        <div
          className={`grid motion-reduce:transition-none ${dockDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
          style={{ transitionProperty: "grid-template-rows" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`flex items-center gap-3 px-4 py-3 transition-all motion-reduce:transition-none ${dockDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open
                  ? "pointer-events-none translate-y-1 opacity-0"
                  : "translate-y-0 opacity-100 delay-75"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:text-orange"
                aria-expanded={false}
                aria-label="Expandir lista de cotización"
              >
                <span className={quoteEyebrowClass}>Cotización</span>
                <span
                  className={`${quoteCountClass} truncate font-medium text-steel-light`}
                >
                  {productLabel}
                </span>
                <ChevronUp
                  className="h-4 w-4 shrink-0 text-steel-mid"
                  strokeWidth={2.25}
                />
              </button>

              <span className="h-6 w-px shrink-0 bg-white/[0.1]" aria-hidden="true" />

              <Link
                href="/contacto"
                className="shrink-0 rounded-xl border border-orange/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange hover:bg-orange/10"
              >
                Cotizar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
