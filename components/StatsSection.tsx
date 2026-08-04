"use client";

import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const STATS = [
  { value: "+15", label: "Años de Experiencia", detail: "Líderes en tueste industrial" },
  { value: "+350", label: "Tostadores Entregados", detail: "En Chile y Latinoamérica" },
  { value: "100%", label: "Acero Inoxidable 304", detail: "Cumplimiento norma sanitaria" },
  { value: "2 Años", label: "Garantía Total", detail: "Respaldo directo de fábrica" },
];

export default function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <Reveal>
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat) => (
            <StaggerItem
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-panel/60 p-6 text-center shadow-lg transition-all hover:border-orange/40 hover:bg-panel"
            >
              <p className="font-display text-4xl sm:text-5xl font-extrabold tabular-nums tracking-wide text-orange">
                {stat.value}
              </p>
              <p className="mt-2 font-display text-lg uppercase tracking-wide text-steel-light">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-steel-mid">
                {stat.detail}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>
    </section>
  );
}
