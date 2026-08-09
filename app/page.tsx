import HeroSection from "@/components/HeroSection";
import HomeCtaBanner from "@/components/HomeCtaBanner";
import HomeFeaturesSection from "@/components/HomeFeaturesSection";
import HomeProcessSection from "@/components/HomeProcessSection";
import RoastablesSection from "@/components/RoastablesSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import { getHeroProductBanners } from "@/lib/hero-images-server";
import { getProducts } from "@/lib/products-server";

export const revalidate = 300;

export default async function Home() {
  const [banners, products] = await Promise.all([
    getHeroProductBanners(),
    getProducts(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Top Hero Slider (Height & Size preserved) */}
      <HeroSection banners={banners} />

      {/* Trust & Impact Metrics */}
      <StatsSection />

      {/* 3-Step Manufacturing & Delivery Process */}
      <HomeProcessSection />

      {/* Commodities & Roastable Products */}
      <RoastablesSection />

      {/* Engineering & Why Choose Fica */}
      <HomeFeaturesSection />

      {/* Full Services */}
      <ServicesSection />

      {/* Final High-Converting Quote CTA */}
      <HomeCtaBanner />
    </main>
  );
}
