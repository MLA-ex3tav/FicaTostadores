"use client";

import {
  Bean,
  Coffee,
  Flame,
  Nut,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";

const roastables: { name: string; subtitle: string; Icon: LucideIcon }[] = [
  { name: "Café", subtitle: "Verde y Especialidad", Icon: Coffee },
  { name: "Cacao", subtitle: "Grano y Nibs", Icon: Bean },
  { name: "Frutos Secos", subtitle: "Maní y Almendras", Icon: Nut },
  { name: "Granos & Cereales", subtitle: "Trigo y Cebada", Icon: Wheat },
  { name: "Semillas", subtitle: "Girasol y Sésamo", Icon: Sprout },
  { name: "Especias", subtitle: "Tueste aromático", Icon: Flame },
];

export default function RoastablesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeader
          eyebrow="Aplicaciones Industriales"
          title={
            <>
              Múltiples <span className="text-orange">Materias Primas</span>
            </>
          }
          description="Tecnología de transferencia térmica versátil adaptada para distintos insumos agrícolas e industriales."
        />
      </Reveal>

      <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {roastables.map((item) => (
          <StaggerItem
            key={item.name}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/70 p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-orange/60 hover:shadow-2xl hover:shadow-black/50"
          >
            {/* Ambient Gradient Glow from Right Edge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-orange/20 via-orange/5 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative z-10 flex flex-col items-center">
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orange/40 bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                <item.Icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-steel-light group-hover:text-orange transition-colors">
                {item.name}
              </h3>
              <p className="mt-1 text-[11px] text-steel-mid">
                {item.subtitle}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
