"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";

export default function MainWithQuotePadding({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { products } = useQuoteSelection();
  const needsMobilePadding =
    products.length > 0 && pathname !== "/contacto";

  return (
    <main
      className={`flex-1 transition-[padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
        needsMobilePadding ? "pb-16 md:pb-0" : ""
      }`}
    >
      {children}
    </main>
  );
}
