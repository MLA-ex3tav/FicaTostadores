"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteProductList from "./QuoteProductList";

const SCROLL_THRESHOLD = 6;
const DRAG_THRESHOLD = 28;

const sheetEase = "cubic-bezier(0.32, 0.72, 0, 1)";
const sheetDuration = "duration-500";

export default function QuoteMobileSheet() {
  const { products } = useQuoteSelection();
  const [expanded, setExpanded] = useState(false);
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const collapse = useCallback(() => setExpanded(false), []);
  const expand = useCallback(() => setExpanded(true), []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < SCROLL_THRESHOLD) {
        return;
      }

      if (delta > 0) {
        collapse();
      } else {
        expand();
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [collapse, expand]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartY.current = event.touches[0].clientY;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const delta = event.changedTouches[0].clientY - touchStartY.current;

    if (delta > DRAG_THRESHOLD) {
      expand();
      return;
    }

    if (delta < -DRAG_THRESHOLD) {
      collapse();
    }
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div
      ref={sheetRef}
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[var(--input-bg)] motion-reduce:transition-none md:hidden ${
        expanded ? "shadow-[0_-8px_24px_rgba(0,0,0,0.4)]" : "shadow-[0_-2px_12px_rgba(0,0,0,0.25)]"
      }`}
      style={{
        transition: `box-shadow 0.5s ${sheetEase}`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full flex-col items-center pt-2.5 pb-1.5"
        aria-expanded={expanded}
        aria-label={
          expanded
            ? "Contraer lista de cotización"
            : "Expandir lista de cotización"
        }
      >
        <span
          className={`h-1 rounded-full bg-steel-dark/50 transition-all motion-reduce:transition-none ${sheetDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
            expanded ? "w-8 bg-steel-mid/60" : "w-10"
          }`}
        />
      </button>

      <div
        className={`grid motion-reduce:transition-none ${sheetDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        style={{ transitionProperty: "grid-template-rows" }}
      >
        <div className="overflow-hidden">
          <div
            className={`max-h-[55vh] overflow-y-auto px-4 pb-4 transition-opacity motion-reduce:transition-none ${sheetDuration} ease-out ${
              expanded
                ? "opacity-100 delay-100"
                : "pointer-events-none opacity-0 delay-0"
            }`}
          >
            <QuoteProductList />
          </div>
        </div>
      </div>

      <div
        className={`grid motion-reduce:transition-none ${sheetDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
          expanded ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        }`}
        style={{ transitionProperty: "grid-template-rows" }}
      >
        <div className="overflow-hidden">
          <div
            className={`flex items-center justify-between gap-3 px-4 pb-3 transition-all motion-reduce:transition-none ${sheetDuration} ease-[cubic-bezier(0.32,0.72,0,1)] ${
              expanded
                ? "pointer-events-none translate-y-1 opacity-0"
                : "translate-y-0 opacity-100 delay-75"
            }`}
          >
            <div className="min-w-0 truncate">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-orange">
                Cotización
              </p>
              <p className="truncate text-[11px] text-steel-dark">
                {products.length}{" "}
                {products.length === 1 ? "producto seleccionado" : "productos seleccionados"}
              </p>
            </div>
            <Link
              href="/contacto"
              className="shrink-0 border border-white/[0.08] px-3 py-1 text-[10px] text-steel-mid transition-colors hover:border-orange/40 hover:text-orange"
            >
              Cotizar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
