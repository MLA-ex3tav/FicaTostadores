import { Globe, MapPin, ShieldCheck, type LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";

const features: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Fabricado en Chile",
    description: "Ingeniería y producción en la IX Región.",
    Icon: MapPin,
  },
  {
    title: "Calidad certificada",
    description: "Acero inoxidable y cumplimiento de norma sanitaria.",
    Icon: ShieldCheck,
  },
  {
    title: "Exportación",
    description: "Maquinaria con envíos a Latinoamérica.",
    Icon: Globe,
  },
];

export default function HomeFeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl border-t border-steel-dark/15 px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-16">
      <Reveal>
        <SectionHeader
          eyebrow="Por qué elegirnos"
          title={
            <>
              Ingeniería de <span className="text-orange">tueste</span>
            </>
          }
        />
      </Reveal>

      <Stagger
        as="ul"
        className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8"
      >
        {features.map((feature) => (
          <StaggerItem
            as="li"
            key={feature.title}
            className="group rounded-xl border border-steel-dark/20 bg-panel/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange/60 hover:bg-panel hover:shadow-lg hover:shadow-black/40"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-orange/40 bg-orange/10 transition-colors group-hover:bg-orange/15">
              <feature.Icon
                className="h-5 w-5 text-orange"
                strokeWidth={1.75}
              />
            </span>
            <h3 className="mt-4 font-display text-lg tracking-wide text-steel-light">
              {feature.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-steel-mid">
              {feature.description}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
