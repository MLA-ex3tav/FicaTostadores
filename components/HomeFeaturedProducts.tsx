"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coffee,
  Factory,
  Flame,
  ShoppingBag,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { defaultProducts, type Product } from "@/lib/products";
import { getProductImageSrc } from "@/lib/product-images";
import { buildQuoteProductItem } from "@/lib/quote-product";
import { useQuoteSelection } from "@/lib/quote-selection";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SectionHeader from "@/components/SectionHeader";
import PromoBadge from "@/components/PromoBadge";

const CATEGORY_TABS = [
  { id: "all", label: "Destacados", icon: Sparkles },
  { id: "cafe", label: "Tostadores Café", icon: Coffee },
  { id: "comercial", label: "Línea Comercial", icon: Flame },
  { id: "industrial", label: "Línea Industrial", icon: Factory },
  { id: "procesamiento", label: "Molinos y Partidores", icon: Wrench },
] as const;

type CategoryTab = (typeof CATEGORY_TABS)[number]["id"];

const FEATURED_FALLBACK_IDS = ["tlc-10kg", "tlc-5kg", "tlc-3kg", "tlc-700g"];

function getProductCategoryGroup(p: Product): string {
  if (p.catalog === "cafe" || p.category === "cafe") return "cafe";
  if (p.category === "comercial") return "comercial";
  if (p.category === "industrial") return "industrial";
  if (p.category === "procesamiento") return "procesamiento";
  return "all";
}

function selectFeaturedProducts(
  products: Product[],
  tab: CategoryTab,
): Product[] {
  const allProds = products.length > 0 ? products : defaultProducts;

  // Filter by category tab if specified
  let pool =
    tab === "all"
      ? allProds
      : allProds.filter((p) => getProductCategoryGroup(p) === tab);

  if (pool.length === 0) {
    pool = allProds;
  }

  // Prioritize: 1) isFeatured, 2) isPromo, 3) Others
  const featured = pool.filter((p) => p.isFeatured);
  const promos = pool.filter((p) => p.isPromo && !p.isFeatured);
  const others = pool.filter((p) => !p.isFeatured && !p.isPromo);

  let ordered = [...featured, ...promos, ...others];

  // If tab === "all" and we have fallback IDs, append fallback defaults if needed
  if (tab === "all" && ordered.length < 4) {
    const fixed = FEATURED_FALLBACK_IDS.map((id) =>
      allProds.find((p) => p.id === id),
    ).filter(Boolean) as Product[];
    ordered = [...ordered, ...fixed];
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const p of ordered) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      unique.push(p);
    }
  }

  return unique.slice(0, 4);
}

interface HomeFeaturedProductsProps {
  products?: Product[];
}

export default function HomeFeaturedProducts({
  products = defaultProducts,
}: HomeFeaturedProductsProps) {
  const { addProduct, hasProduct } = useQuoteSelection();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  const featuredProducts = useMemo(
    () => selectFeaturedProducts(products, activeTab),
    [products, activeTab],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeader
          eyebrow="Equipos Destacados"
          title={
            <>
              Tostadores <span className="text-orange">Industriales Fica</span>
            </>
          }
          description="Diseñados y fabricados en Chile para tostadores artesanales y plantas industriales de alto rendimiento."
        />
      </Reveal>

      {/* Premium Glassmorphic Category Tabs Bar */}
      <div className="mt-10 flex justify-center">
        <div className="relative flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/[0.08] bg-surface/70 p-1.5 shadow-2xl backdrop-blur-xl">
          {/* Subtle Ambient Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange/10 via-orange/5 to-transparent blur-lg opacity-50"
          />

          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors z-10 ${
                  isActive
                    ? "text-white"
                    : "text-steel-mid hover:text-steel-light hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange via-orange to-orange-hover shadow-lg shadow-orange/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className={`relative z-10 h-3.5 w-3.5 ${
                    isActive ? "text-white" : "text-steel-dark group-hover:text-steel-light"
                  }`}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Stagger
        key={activeTab}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featuredProducts.map((product) => {
          if (!product) return null;

          const isSelected = hasProduct(product.id);
          const imageSrc = getProductImageSrc(product.images?.[0]);

          return (
            <StaggerItem
              key={product.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange/60 hover:shadow-2xl hover:shadow-black/50"
            >
              {/* Diffused Ambient Glow from Right Edge */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-orange/20 via-orange/5 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* Product Thumbnail Container */}
              <div className="relative z-10">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface border border-white/[0.06]">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface/80 p-4 text-center">
                      <Factory className="h-10 w-10 text-orange/60 mb-1" strokeWidth={1.5} />
                      <span className="font-display text-xs uppercase tracking-widest text-steel-dark font-bold">
                        {product.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 rounded-full border border-orange/40 bg-background/90 px-2.5 py-1 text-[11px] font-bold text-orange shadow-md backdrop-blur-md">
                    {product.capacity}
                  </div>

                  <div className="absolute left-2.5 top-2.5 z-[1] flex flex-col gap-1.5 items-start">
                    {product.isPromo ? (
                      <PromoBadge label={product.promoTag} />
                    ) : null}

                    {product.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-background/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 shadow-md backdrop-blur-md">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Destacado
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange">
                    {product.catalog === "cafe"
                      ? "Línea Café Profesional"
                      : "Maquinaria Industrial Fica"}
                  </p>

                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-steel-light group-hover:text-orange transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-steel-mid line-clamp-2">
                    {product.description}
                  </p>

                  {/* Specs badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.specs.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="rounded border border-white/[0.08] bg-surface/60 px-2 py-0.5 text-[10px] text-steel-mid font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.06] space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    addProduct(buildQuoteProductItem(product, []), true)
                  }
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md ${
                    isSelected
                      ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-orange text-white hover:bg-orange-hover shadow-orange/20"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      En tu Cotización
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Cotizar Este Equipo
                    </>
                  )}
                </button>

                <Link
                  href={`/productos/${product.id}`}
                  className="inline-flex h-9 w-full items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-steel-mid hover:text-steel-light transition-colors"
                >
                  Ver ficha técnica
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Catalog Link Banner */}
      <div className="mt-12 text-center">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-panel/80 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-steel-light shadow-xl transition-all hover:border-orange hover:text-orange hover:shadow-orange/10"
        >
          <Sparkles className="h-4 w-4 text-orange" />
          Explorar Catálogo Completo (Tostadores, Molinos y Partidores)
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
