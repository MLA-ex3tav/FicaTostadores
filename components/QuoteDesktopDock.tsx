"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteProductList from "./QuoteProductList";

const dockDuration = "duration-350";

export default function QuoteDesktopDock() {
  const { products, setDesktopDockOpen } = useQuoteSelection();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDesktopDockOpen(open);

    return () => {
      setDesktopDockOpen(false);
    };
  }, [open, setDesktopDockOpen]);

  if (products.length === 0) {
    return null;
  }

  const productCount = products.length;

  return (
    <div className="fixed bottom-5 right-5 z-40 hidden md:block">
      <div className="w-[17.5rem] overflow-hidden rounded-xl border border-white/[0.1] bg-[var(--input-bg)] shadow-[0_6px_24px_rgba(0,0,0,0.35)] motion-reduce:transition-none">
        <div
          className={`grid motion-reduce:transition-none ${dockDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          style={{ transitionProperty: "grid-template-rows" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`flex max-h-[min(60vh,28rem)] flex-col px-3.5 py-3.5 transition-opacity motion-reduce:transition-none ${dockDuration} ease-out ${
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
              className={`flex items-center gap-2 px-2.5 py-2 transition-all motion-reduce:transition-none ${dockDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open
                  ? "pointer-events-none translate-y-1 opacity-0"
                  : "translate-y-0 opacity-100 delay-75"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:text-orange"
                aria-expanded={false}
                aria-label={`Expandir cotización (${productCount} ${productCount === 1 ? "producto" : "productos"})`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange">
                  Cotización
                </span>
                <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange/15 px-1.5 text-xs font-semibold tabular-nums text-orange">
                  {productCount}
                </span>
                <ChevronUp
                  className="h-3.5 w-3.5 shrink-0 text-steel-mid"
                  strokeWidth={2}
                />
              </button>

              <span className="h-5 w-px shrink-0 bg-white/[0.1]" aria-hidden="true" />

              <Link
                href="/contacto"
                className="shrink-0 rounded-lg border border-orange/40 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange hover:bg-orange/10"
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
