"use client";

import { usePathname } from "next/navigation";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteDesktopDock from "./QuoteDesktopDock";
import QuoteMobileSheet from "./QuoteMobileSheet";

export default function QuoteSelectionSidebar() {
  const pathname = usePathname();
  const { products } = useQuoteSelection();

  if (products.length === 0 || pathname === "/contacto") {
    return null;
  }

  return (
    <>
      <QuoteDesktopDock />
      <QuoteMobileSheet />
    </>
  );
}
