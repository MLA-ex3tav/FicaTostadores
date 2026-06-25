import Link from "next/link";
import {
  ArrowRight,
  Factory,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";

const services: {
  title: string;
  description: string;
  href: string;
  cta: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Tostado industrial",
    description: "Tostadoras para producción artesanal e industrial.",
    href: "/productos",
    cta: "Ver tostadoras",
    Icon: Factory,
  },
  {
    title: "Soporte técnico",
    description: "Instalación, puesta en marcha, mantenimiento y repuestos.",
    href: "/servicio-tecnico",
    cta: "Solicitar soporte",
    Icon: Headphones,
  },
];

export default function ServicesSection() {
  return (
    <section className="border-t border-steel-dark/15 py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Servicios"
            title={
              <>
                Soluciones <span className="text-orange">completas</span>
              </>
            }
            description="Equipamiento y acompañamiento para cada etapa de su planta."
          />
        </Reveal>

        <Stagger className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
          {services.map((service) => (
            <StaggerItem as="article" key={service.title}>
              <service.Icon
                className="h-5 w-5 text-orange"
                strokeWidth={1.75}
              />
              <h3 className="mt-3 font-display text-xl tracking-wide text-steel-light">
                {service.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-steel-mid">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-4 inline-flex items-center gap-1.5 text-base text-orange transition-colors hover:text-orange-hover"
              >
                {service.cta}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
