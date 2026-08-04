"use client";

import { Flame, Truck, Wrench, type LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";

const STEPS: {
  title: string;
  subtitle: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Asesoría & Configuración",
    subtitle: "Definición del proyecto",
    description:
      "Evaluamos la capacidad necesaria para tu negocio y configuramos el tipo de gas, voltaje, acabados de color y accesorios opcionales.",
    Icon: Flame,
  },
  {
    title: "Fabricación Industrial",
    subtitle: "IX Región, Chile",
    description:
      "Construimos tu equipo en acero inoxidable 304 con corte de precisión, soldaduras sanitarias y sistemas de control de temperatura.",
    Icon: Wrench,
  },
  {
    title: "Entrega & Puesta en Marcha",
    subtitle: "Garantía de 2 Años",
    description:
      "Entregamos tu tostador listo para operar, con capacitación en perfilado de tueste y respaldo técnico directo de fábrica.",
    Icon: Truck,
  },
];

export default function HomeProcessSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeader
          eyebrow="Proceso de Trabajo"
          title={
            <>
              De Nuestra Fábrica a <span className="text-orange">tu Planta</span>
            </>
          }
          description="Acompañamos tu proyecto desde la ingeniería inicial hasta la producción continua de tu tostaduría."
        />
      </Reveal>

      <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <StaggerItem
            key={step.title}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange/60 hover:shadow-2xl hover:shadow-black/50"
          >
            {/* Ambient Gradient Glow from Right Edge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-orange/20 via-orange/5 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative z-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orange/40 bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                <step.Icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-steel-light">
                {step.title}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-orange">
                {step.subtitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel-mid">
                {step.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
