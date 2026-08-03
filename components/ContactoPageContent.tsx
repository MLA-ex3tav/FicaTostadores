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

    <>

      <div className="mb-10 sm:mb-12">{children}</div>



      <div className="mx-auto w-full max-w-lg space-y-6 sm:space-y-8">

        {hasProducts ? <ContactoQuotePanel /> : null}



        <Suspense

          fallback={

            <div className="h-96 animate-pulse rounded-lg border border-white/[0.06] bg-panel/40" />

          }

        >

          <ContactForm />

        </Suspense>

      </div>

    </>

  );

}


