import Link from "next/link";
import HeroImageCorridor from "./HeroImageCorridor";
import type { HeroProductBanner } from "@/lib/images";

interface HeroSectionProps {
  banners: HeroProductBanner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pt-6 md:px-6 md:pt-10">
        <HeroImageCorridor banners={banners} />

        <div className="relative max-w-2xl py-10 md:py-14">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-steel-mid">
            Maquinaria Industrial
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-wide text-steel-light md:text-5xl xl:text-6xl">
            FICA <span className="text-orange">TOSTADORES</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-steel-mid md:text-xl">
            Equipos de tostado y procesamiento para café, cacao, frutos secos,
            granos, semillas y más. Tecnología robusta, precisión en cada lote
            y soporte técnico especializado.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-xl bg-orange px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
            >
              Ver productos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-xl border border-steel-mid/40 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
            >
              Contactar
            </Link>
          </div>
        </div>

        <div className="rivet-divider relative">
          <span />
        </div>
      </div>
    </section>
  );
}
