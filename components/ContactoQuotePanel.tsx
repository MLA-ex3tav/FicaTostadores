"use client";

import QuoteProductList from "./QuoteProductList";

export default function ContactoQuotePanel() {
  return (
    <section
      aria-label="Productos en cotización"
      className="rounded-lg border border-white/[0.06] bg-panel/40 px-4 py-4 sm:px-5"
    >
      <QuoteProductList showCta={false} variant="minimal" />
    </section>
  );
}
