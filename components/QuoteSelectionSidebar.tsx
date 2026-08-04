"use client";

import { usePathname } from "next/navigation";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteDesktopDock from "./QuoteDesktopDock";
import QuoteDrawer from "./QuoteDrawer";
import QuoteMobileSheet from "./QuoteMobileSheet";

export default function QuoteSelectionSidebar() {
  const pathname = usePathname();
  const { products } = useQuoteSelection();

  const isCheckoutPage = pathname === "/contacto" || pathname === "/cotizar";

  return (
    <>
      <QuoteDrawer />
      {products.length > 0 && !isCheckoutPage && (
        <>
          <QuoteDesktopDock />
          <QuoteMobileSheet />
        </>
      )}
    </>
  );
}
