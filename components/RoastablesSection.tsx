import {
  Bean,
  Coffee,
  Flame,
  Nut,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";

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
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Aplicaciones
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-wide text-steel-light md:text-3xl">
          Múltiples <span className="text-orange">materias primas</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-steel-mid">
          Una línea de equipos para café, cacao, frutos secos, granos, semillas
          y especias.
        </p>
      </div>

      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-10">
        {roastables.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-2.5 text-steel-mid"
          >
            <item.Icon
              className="h-4 w-4 shrink-0 text-orange/90"
              strokeWidth={1.75}
            />
            <span className="text-sm">{item.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
