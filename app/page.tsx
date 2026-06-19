import { Globe, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import RoastablesSection from "@/components/RoastablesSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import { getHeroProductBanners } from "@/lib/hero-images-server";

export const dynamic = "force-dynamic";

const features: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Calidad industrial",
    description:
      "Materiales de alta resistencia para operación continua en planta.",
    Icon: ShieldCheck,
  },
  {
    title: "Soporte técnico",
    description:
      "Instalación, puesta en marcha y mantenimiento preventivo.",
    Icon: Headphones,
  },
  {
    title: "Exportación",
    description: "Maquinaria certificada con envíos a Latinoamérica.",
    Icon: Globe,
  },
];

export default async function Home() {
  const banners = await getHeroProductBanners();

  return (
    <>
      <HeroSection banners={banners} />
      <StatsSection />
      <RoastablesSection />
      <ServicesSection />

      <section className="mx-auto max-w-6xl border-t border-steel-dark/15 px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-16">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Por qué elegirnos
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-wide text-steel-light md:text-3xl">
            Ingeniería de <span className="text-orange">tueste</span>
          </h2>
        </div>

        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <li key={feature.title}>
              <feature.Icon
                className="h-5 w-5 text-orange"
                strokeWidth={1.75}
              />
              <h3 className="mt-3 font-display text-base tracking-wide text-steel-light">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-mid">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
