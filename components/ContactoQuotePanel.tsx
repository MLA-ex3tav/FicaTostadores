"use client";

import QuoteProductList from "./QuoteProductList";
import SteelPanel from "./SteelPanel";

export default function ContactoQuotePanel() {
  return (
    <SteelPanel className="h-fit p-4 lg:sticky lg:top-24">
      <QuoteProductList showCta={false} />
    </SteelPanel>
  );
}
