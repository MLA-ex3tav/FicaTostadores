import type { Metadata } from "next";
import QuotePageContent from "@/components/QuotePageContent";

export const metadata: Metadata = {
  title: "Cotizar Maquinaria | Fica Tostadores",
  description:
    "Solicite su cotización personalizada para tostadores de café, tostadores comerciales e industriales Fica.",
};

export default function CotizarPage() {
  return <QuotePageContent />;
}
