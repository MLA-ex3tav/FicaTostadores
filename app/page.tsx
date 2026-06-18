import IconBadge from "@/components/IconBadge";
import { Globe, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import RoastablesSection from "@/components/RoastablesSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import SteelPanel from "@/components/SteelPanel";
import { getHeroProductBanners } from "@/lib/hero-images-server";

export const dynamic = "force-dynamic";

const features: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Calidad Industrial",
    description:
      "Equipos construidos con materiales de alta resistencia para operación continua en plantas de producción.",
    Icon: ShieldCheck,
  },
  {
    title: "Soporte Técnico",
    description:
      "Asesoramiento en instalación, puesta en marcha y mantenimiento preventivo de toda nuestra línea de productos.",
    Icon: Headphones,
  },
  {
    title: "Exportación",
    description:
      "Maquinaria certificada y lista para operar en mercados internacionales. Envíos a toda Latinoamérica.",
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

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Por qué elegirnos
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
            INGENIERÍA DE <span className="text-orange">TUESTE</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <SteelPanel key={feature.title}>
              <IconBadge>
                <feature.Icon className="h-6 w-6" strokeWidth={1.75} />
              </IconBadge>
              <h3 className="font-display text-lg tracking-wide text-steel-light">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-mid">
                {feature.description}
              </p>
            </SteelPanel>
          ))}
        </div>
      </section>
    </>
  );
}
