import type { Metadata } from "next";
import QuotePageContent from "@/components/QuotePageContent";

export const metadata: Metadata = {
  title: "Contacto & Cotización | Fica Tostadores",
  description:
    "Contacte a Fica Tostadores para consultas y cotizaciones sobre maquinaria industrial de tostado.",
};

export default function ContactoPage() {
  return <QuotePageContent />;
}
