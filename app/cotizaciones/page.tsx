import { Suspense } from "react";
import QuotesList from "@/components/QuotesList";

export const metadata = {
  title: "Cotizaciones | Fica Tostadores",
  description: "Consultas de cotización registradas.",
  robots: {
    index: false,
    follow: false,
  },
};

function QuotesFallback() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-xl bg-panel" />
      ))}
    </div>
  );
}

export default function CotizacionesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Registro
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
          <span className="text-orange">COTIZACIONES</span>
        </h1>
        <p className="mt-4 text-sm text-steel-mid">
          Consultas ordenadas por fecha, más recientes primero.
        </p>
      </div>

      <Suspense fallback={<QuotesFallback />}>
        <QuotesList />
      </Suspense>
    </div>
  );
}
