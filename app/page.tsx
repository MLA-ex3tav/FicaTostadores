import { Globe, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import RoastablesSection from "@/components/RoastablesSection";
import SectionHeader from "@/components/SectionHeader";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import TrustSealsSection from "@/components/TrustSealsSection";
import { getHeroProductBanners } from "@/lib/hero-images-server";

export const revalidate = 300;

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
        <SectionHeader
          eyebrow="Por qué elegirnos"
          title={
            <>
              Ingeniería de <span className="text-orange">tueste</span>
            </>
          }
        />

        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <li key={feature.title}>
              <feature.Icon
                className="h-5 w-5 text-orange"
                strokeWidth={1.75}
              />
              <h3 className="mt-3 font-display text-lg tracking-wide text-steel-light">
                {feature.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-steel-mid">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <TrustSealsSection />
    </>
  );
}
