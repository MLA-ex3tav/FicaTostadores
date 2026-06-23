import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import TechnicalServiceForm from "@/components/TechnicalServiceForm";
import { companyInfo } from "@/lib/company";
import { getProducts } from "@/lib/products-server";

export const metadata = {
  title: "Servicio técnico | Fica Tostadores",
  description:
    "Solicite soporte técnico, mantenimiento o repuestos para su equipo Fica Tostadores.",
};

function TechnicalServiceFormFallback() {
  return (
    <div
      className="h-96 animate-pulse rounded-lg border border-white/[0.06] bg-panel/40"
      role="status"
    />
  );
}

export default async function ServicioTecnicoPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-16 sm:py-16 md:px-6 md:py-24">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-steel-mid transition-colors hover:text-orange"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Soporte
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
            <span className="text-orange">SERVICIO TÉCNICO</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-steel-mid">
            Reporte una falla, pida mantenimiento o repuestos. Indique el equipo
            y el problema para que el equipo técnico pueda ayudarle con mayor
            rapidez.
          </p>

          <dl className="mt-8 hidden space-y-4 text-sm lg:block">
            <div>
              <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark">
                Correo
              </dt>
              <dd className="mt-1.5 text-steel-mid">
                <a
                  href={`mailto:${companyInfo.emailVentas}`}
                  className="transition-colors hover:text-orange"
                >
                  {companyInfo.emailVentas}
                </a>
              </dd>
            </div>
            {companyInfo.phones.map((phone) => (
              <div key={phone.href}>
                <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark">
                  {phone.label}
                </dt>
                <dd className="mt-1.5 text-steel-mid">
                  <a
                    href={phone.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-orange"
                  >
                    {phone.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Suspense fallback={<TechnicalServiceFormFallback />}>
          <TechnicalServiceForm products={products} />
        </Suspense>
      </div>
    </div>
  );
}
