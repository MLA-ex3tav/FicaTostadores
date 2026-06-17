import Link from "next/link";
import {
  ArrowRight,
  Factory,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import IconBadge from "./IconBadge";
import SteelPanel from "./SteelPanel";

const services: {
  title: string;
  description: string;
  href: string;
  cta: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Tostado industrial",
    description:
      "Tostadoras de distintas capacidades para producción artesanal e industrial.",
    href: "/productos",
    cta: "Ver tostadoras",
    Icon: Factory,
  },
  {
    title: "Soporte técnico",
    description:
      "Instalación, puesta en marcha, mantenimiento preventivo y repuestos.",
    href: "/contacto",
    cta: "Solicitar soporte",
    Icon: Headphones,
  },
];

export default function ServicesSection() {
  return (
    <section className="border-y border-steel-dark/20 bg-surface/50 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Servicios
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
            SOLUCIONES <span className="text-orange">COMPLETAS</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-steel-mid">
            Desde el equipamiento hasta el soporte postventa, acompañamos cada
            etapa de su planta de tostado.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <SteelPanel key={service.title} className="flex flex-col p-5 md:p-6">
              <IconBadge>
                <service.Icon className="h-6 w-6" strokeWidth={1.75} />
              </IconBadge>
              <h3 className="font-display text-lg tracking-wide text-steel-light">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-mid">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange transition-colors hover:text-orange-hover"
              >
                {service.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SteelPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
