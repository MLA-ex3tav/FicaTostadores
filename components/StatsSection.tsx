import { Factory, Globe, ShieldCheck, type LucideIcon } from "lucide-react";
import IconBadge from "./IconBadge";

const stats: {
  value: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    value: "6+",
    label: "Líneas de producto",
    Icon: Factory,
  },
  {
    value: "6+",
    label: "Países atendidos",
    Icon: Globe,
  },
  {
    value: "100%",
    label: "Soporte postventa",
    Icon: ShieldCheck,
  },
];

export default function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-steel-dark/25 bg-panel/80 p-5"
          >
            <IconBadge className="mb-0 shrink-0">
              <stat.Icon className="h-5 w-5" strokeWidth={1.75} />
            </IconBadge>
            <div>
              <p className="font-display text-3xl tracking-wide text-orange">
                {stat.value}
              </p>
              <p className="text-sm text-steel-mid">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
