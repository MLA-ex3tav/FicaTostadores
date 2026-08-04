"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { buildQuoteWhatsAppUrl, openWhatsAppContact } from "@/lib/quoting";
import Reveal from "@/components/motion/Reveal";

export default function HomeCtaBanner() {
  const handleWhatsAppClick = () => {
    const url = buildQuoteWhatsAppUrl(
      "Cliente Web",
      "",
      "Hola Fica Tostadores, me gustaría recibir asesoría técnica y cotización para un tostador:",
    );
    openWhatsAppContact(url);
  };

  return (
    <section className="border-t border-white/[0.08] bg-panel/90 py-16 md:py-24 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-orange/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 md:px-6 text-center relative z-10 space-y-6">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange">
            <Sparkles className="h-4 w-4" />
            <span>Fábrica Directa en Chile</span>
          </div>

          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-wide text-steel-light">
            ¿LISTO PARA POTENCIAR <span className="text-orange">TU TOSTADURÍA?</span>
          </h2>

          <p className="mx-auto max-w-2xl text-base text-steel-mid leading-relaxed">
            Diseñamos y fabricamos maquinaria a medida con garantía de 2 años, repuestos originales inmediatos y respaldo de ingeniería nacional.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cotizar"
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-orange px-8 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-hover shadow-lg shadow-orange/20"
            >
              Solicitar Cotización Ahora
              <ArrowRight className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-8 text-sm font-semibold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <MessageSquare className="h-5 w-5" />
              Asesoría por WhatsApp
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-steel-mid">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-orange" />
              Garantía de 2 años en estructura y tambor
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-orange" />
              Repuestos 100% disponibles en Chile
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
