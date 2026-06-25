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

const roastables: { name: string; Icon: LucideIcon }[] = [
  { name: "Café", Icon: Coffee },
  { name: "Cacao", Icon: Bean },
  { name: "Frutos secos", Icon: Nut },
  { name: "Granos y cereales", Icon: Wheat },
  { name: "Semillas", Icon: Sprout },
  { name: "Especias", Icon: Flame },
];

export default function RoastablesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
      <Reveal>
        <SectionHeader
          eyebrow="Aplicaciones"
          title={
            <>
              Múltiples <span className="text-orange">materias primas</span>
            </>
          }
          description="Equipos para tueste y procesamiento en planta."
        />
      </Reveal>

      <Stagger
        as="ul"
        className="mt-10 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-10"
      >
        {roastables.map((item) => (
          <StaggerItem
            as="li"
            key={item.name}
            className="flex items-center gap-2.5 text-steel-mid"
          >
            <item.Icon
              className="h-4 w-4 shrink-0 text-orange/90"
              strokeWidth={1.75}
            />
            <span className="text-base">{item.name}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
