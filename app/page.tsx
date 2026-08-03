import HeroSection from "@/components/HeroSection";
import HomeContactSection from "@/components/HomeContactSection";
import HomeFeaturesSection from "@/components/HomeFeaturesSection";
import RoastablesSection from "@/components/RoastablesSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import { getHeroProductBanners } from "@/lib/hero-images-server";

export const revalidate = 300;

export default async function Home() {
  const banners = await getHeroProductBanners();

  return (
    <>
      <HeroSection banners={banners} />
      <HomeContactSection />
      <StatsSection />
      <RoastablesSection />
      <ServicesSection />
      <HomeFeaturesSection />
    </>
  );
}
