"use client";

import QuoteProductList from "./QuoteProductList";

export default function ContactoQuotePanel() {
  return (
    <div className="h-fit rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4 lg:sticky lg:top-24">
      <QuoteProductList showCta={false} />
    </div>
  );
}
