import {
  Bean,
  Coffee,
  Flame,
  Nut,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import IconBadge from "./IconBadge";
import SteelPanel from "./SteelPanel";

const roastables: {
  name: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    name: "Café",
    description: "Granos verdes y especiales con perfiles de tueste personalizados.",
    Icon: Coffee,
  },
  {
    name: "Cacao",
    description: "Nibs y granos de cacao para chocolatería y confitería.",
    Icon: Bean,
  },
  {
    name: "Frutos secos",
    description: "Almendras, maní, castañas, nueces y mezclas gourmet.",
    Icon: Nut,
  },
  {
    name: "Granos y cereales",
    description: "Maíz, trigo, cebada, malta y otros granos alimenticios.",
    Icon: Wheat,
  },
  {
    name: "Semillas",
    description: "Girasol, chía, lino, sésamo y semillas funcionales.",
    Icon: Sprout,
  },
  {
    name: "Especias",
    description: "Pimienta, comino, canela y mezclas de especias secas.",
    Icon: Flame,
  },
];

export default function RoastablesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Aplicaciones
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
          MÚLTIPLES <span className="text-orange">MATERIAS PRIMAS</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-steel-mid">
          Nuestros equipos no están limitados al café. Tostamos y procesamos una
          amplia variedad de productos para la industria alimentaria.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roastables.map((item) => (
          <SteelPanel key={item.name} className="p-5 md:p-6">
            <IconBadge>
              <item.Icon className="h-6 w-6" strokeWidth={1.75} />
            </IconBadge>
            <h3 className="font-display text-lg tracking-wide text-orange">
              {item.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-mid">
              {item.description}
            </p>
          </SteelPanel>
        ))}
      </div>
    </section>
  );
}
