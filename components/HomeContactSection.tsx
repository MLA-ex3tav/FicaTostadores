import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";
import { companyInfo } from "@/lib/company";

export default function HomeContactSection() {
  return (
    <section className="border-b border-steel-dark/15 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionHeader
          eyebrow="Contacto"
          title={
            <>
              Hablemos de su <span className="text-orange">proyecto</span>
            </>
          }
          description="Cotizaciones y consultas comerciales."
          />
        </Reveal>

        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
          <div>
            <dt className="flex items-center gap-2 text-sm uppercase tracking-widest text-steel-dark">
              <Mail className="h-4 w-4 text-orange" strokeWidth={1.75} />
              Correo
            </dt>
            <dd className="mt-2 text-base text-steel-mid">
              <a
                href={`mailto:${companyInfo.emailVentas}`}
                className="break-all transition-colors hover:text-orange"
              >
                {companyInfo.emailVentas}
              </a>
            </dd>
          </div>
          </StaggerItem>

          {companyInfo.phones.map((phone) => (
            <StaggerItem key={phone.href}>
            <div>
              <dt className="flex items-center gap-2 text-sm uppercase tracking-widest text-steel-dark">
                <Phone className="h-4 w-4 text-orange" strokeWidth={1.75} />
                {phone.label}
              </dt>
              <dd className="mt-2 text-base text-steel-mid">
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
            </StaggerItem>
          ))}

          <StaggerItem>
          <div>
            <dt className="flex items-center gap-2 text-sm uppercase tracking-widest text-steel-dark">
              <Phone className="h-4 w-4 text-orange" strokeWidth={1.75} />
              Teléfono fijo
            </dt>
            <dd className="mt-2 text-base text-steel-mid">
              <a
                href={`tel:${companyInfo.phoneLandline.replace(/\s/g, "")}`}
                className="transition-colors hover:text-orange"
              >
                {companyInfo.phoneLandline}
              </a>
            </dd>
          </div>
          </StaggerItem>

          <StaggerItem className="sm:col-span-2 lg:col-span-4">
          <div>
            <dt className="flex items-center gap-2 text-sm uppercase tracking-widest text-steel-dark">
              <MapPin className="h-4 w-4 text-orange" strokeWidth={1.75} />
              Fábrica
            </dt>
            <dd className="mt-2 text-base leading-relaxed text-steel-mid">
              {companyInfo.address}
            </dd>
          </div>
          </StaggerItem>
        </Stagger>

        <Reveal delay={0.15}>
        <Link
          href="/contacto"
          className="mt-8 inline-flex items-center gap-1.5 text-base font-medium text-orange transition-colors hover:text-orange-hover"
        >
          Solicitar cotización
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        </Reveal>
      </div>
    </section>
  );
}
