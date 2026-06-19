const stats: { value: string; label: string }[] = [
  { value: "6+", label: "Líneas de producto" },
  { value: "6+", label: "Países atendidos" },
  { value: "100%", label: "Soporte postventa" },
];

export default function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-col divide-y divide-steel-dark/15 border-y border-steel-dark/15 sm:flex-row sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex-1 px-4 py-6 text-center sm:py-7"
          >
            <p className="font-display text-3xl tracking-wide text-orange md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-steel-mid">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
