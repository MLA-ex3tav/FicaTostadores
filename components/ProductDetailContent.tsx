"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { motionDuration, motionEase } from "@/lib/motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

interface ProductDetailContentProps {
  product: Product;
}

type TabId = "descripcion" | "caracteristicas" | "ficha";

interface TabDef {
  id: TabId;
  label: string;
  accent?: string;
}

const TABS: TabDef[] = [
  { id: "descripcion", label: "Descripción" },
  { id: "caracteristicas", label: "Características" },
  { id: "ficha", label: "Ficha", accent: "técnica" },
];

export default function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  /* Skip "descripcion" tab when there's no long description */
  const availableTabs = product.longDescription
    ? TABS
    : TABS.filter((t) => t.id !== "descripcion");

  const [activeTab, setActiveTab] = useState<TabId>(availableTabs[0].id);
  const [direction, setDirection] = useState(0);

  function handleTabChange(nextTab: TabId) {
    const currentIndex = availableTabs.findIndex((t) => t.id === activeTab);
    const nextIndex = availableTabs.findIndex((t) => t.id === nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(nextTab);
  }

  return (
    <section className="mt-14">
      {/* ── Tab bar ── */}
      <div className="product-tab-bar">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="product-tab-btn"
            data-active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
            {tab.accent ? (
              <span className="ml-1 text-orange">{tab.accent}</span>
            ) : null}

            {/* Animated underline indicator */}
            {activeTab === tab.id ? (
              <motion.span
                layoutId="product-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-orange"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                }}
              />
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="relative mt-8 min-h-[16rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{
              duration: motionDuration.fast,
              ease: motionEase,
            }}
          >
            {activeTab === "descripcion" && product.longDescription ? (
              <DescripcionPanel text={product.longDescription} />
            ) : activeTab === "caracteristicas" ? (
              <CaracteristicasPanel
                features={product.features}
                productId={product.id}
              />
            ) : activeTab === "ficha" ? (
              <FichaTecnicaPanel
                details={product.technicalDetails}
                productId={product.id}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Descripción ── */
function DescripcionPanel({ text }: { text: string }) {
  return (
    <p className="max-w-prose text-base leading-[1.9] text-steel-mid">
      {text}
    </p>
  );
}

/* ── Características ── */
function CaracteristicasPanel({
  features,
  productId,
}: {
  features: string[];
  productId: string;
}) {
  return (
    <Stagger as="ul">
      {features.map((feature, index) => (
        <StaggerItem
          key={`${productId}-feat-${index}`}
          as="li"
          className={`flex gap-4 py-3.5 text-base leading-relaxed text-steel-mid ${
            index < features.length - 1
              ? "border-b border-white/[0.06]"
              : ""
          }`}
        >
          <span
            className="mt-[0.55rem] h-px w-4 shrink-0 bg-orange/80"
            aria-hidden
          />
          {feature}
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ── Ficha técnica ── */
function FichaTecnicaPanel({
  details,
  productId,
}: {
  details: { label: string; value: string }[];
  productId: string;
}) {
  return (
    <Stagger
      as="dl"
      className="overflow-hidden rounded-lg border border-white/[0.08]"
    >
      {details.map((detail, index) => (
        <StaggerItem
          key={`${productId}-detail-${index}`}
          className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-baseline sm:gap-6 sm:px-5 ${
            index < details.length - 1
              ? "border-b border-white/[0.06]"
              : ""
          }`}
        >
          <dt className="text-xs uppercase tracking-[0.14em] text-steel-dark">
            {detail.label}
          </dt>
          <dd className="text-base font-medium tracking-wide text-steel-light sm:text-right">
            {detail.value}
          </dd>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
