"use client";

import { Suspense, type ReactNode } from "react";
import ContactForm from "@/components/ContactForm";
import ContactoQuotePanel from "@/components/ContactoQuotePanel";
import { useQuoteSelection } from "@/lib/quote-selection";

interface ContactoPageContentProps {
  children: ReactNode;
}

export default function ContactoPageContent({
  children,
}: ContactoPageContentProps) {
  const { products } = useQuoteSelection();
  const hasProducts = products.length > 0;

  return (
    <div
      className={`grid gap-10 sm:gap-12 ${
        hasProducts
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]"
          : "lg:grid-cols-2 lg:gap-16"
      }`}
    >
      <div className="order-1 min-w-0 lg:order-none">{children}</div>

      <div className="order-3 min-w-0 lg:order-none">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl bg-panel" />
          }
        >
          <ContactForm />
        </Suspense>
      </div>

      {hasProducts ? (
        <div className="order-2 min-w-0 lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <ContactoQuotePanel />
        </div>
      ) : null}
    </div>
  );
}
