"use client";

import Link from "next/link";
import { ArrowRight, Factory, Headphones, type LucideIcon } from "lucide-react";
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
    title: "Tostado Industrial & Artesanal",
    description: "Líneas completas de tostadoras de café, molinos a martillo y partidores de frutos secos.",
    href: "/productos",
    cta: "Ver catálogo de tostadoras",
    Icon: Factory,
  },
  {
    title: "Soporte Técnico & Mantención",
    description: "Instalación, puesta en marcha, mantención preventiva y repuestos de fábrica.",
    href: "/servicio-tecnico",
    cta: "Solicitar soporte técnico",
    Icon: Headphones,
  },
];

export default function ServicesSection() {
  return (
    <section className="border-t border-white/[0.08] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Servicios Especializados"
            title={
              <>
                Soluciones <span className="text-orange">Completas</span>
              </>
            }
            description="Equipamiento y acompañamiento técnico continuo para cada etapa de su planta."
          />
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service) => (
            <StaggerItem
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange/60 hover:shadow-2xl hover:shadow-black/50"
            >
              {/* Ambient Gradient Glow from Right Edge */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-orange/20 via-orange/5 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="relative z-10">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orange/40 bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                  <service.Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide text-steel-light">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-mid">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange transition-colors hover:text-orange-hover"
                >
                  {service.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
