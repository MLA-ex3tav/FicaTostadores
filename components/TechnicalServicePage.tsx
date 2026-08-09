import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Suspense } from "react";
import TechnicalServiceForm from "@/components/TechnicalServiceForm";
import { companyInfo } from "@/lib/company";
import { getProducts } from "@/lib/products-server";

function TechnicalServiceFormFallback() {
  return (
    <div
      className="h-96 animate-pulse rounded-lg border border-white/[0.06] bg-panel/40"
      role="status"
    />
  );
}

export default async function TechnicalServicePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen">
      {/* Hero compacto + formulario */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14 md:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-steel-mid transition-colors hover:text-orange"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <p className="text-xs uppercase tracking-[0.3em] text-orange">
          Soporte técnico
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-wide text-steel-light md:text-5xl">
          PIDE <span className="text-orange">SOPORTE TÉCNICO</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-steel-mid">
          Cuéntanos qué equipo tienes y qué falla o servicio necesitas. Te
          ayudamos en minutos.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-steel-mid">
          <a
            href={`mailto:${companyInfo.emailVentas}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-orange"
          >
            <Mail className="h-4 w-4" />
            {companyInfo.emailVentas}
          </a>
          {companyInfo.phones.map((phone) => (
            <a
              key={phone.href}
              href={phone.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-orange"
            >
              <Phone className="h-4 w-4" />
              {phone.value}
            </a>
          ))}
        </div>

        <div className="mt-10">
          <Suspense fallback={<TechnicalServiceFormFallback />}>
            <TechnicalServiceForm products={products} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
