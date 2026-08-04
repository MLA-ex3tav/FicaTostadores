"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileText,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { defaultProducts } from "@/lib/products";
import { getProductImageSrc } from "@/lib/product-images";
import { buildQuoteWhatsAppUrl, openWhatsAppContact } from "@/lib/quoting";
import { useQuoteSelection } from "@/lib/quote-selection";
import { buildQuoteProductItem } from "@/lib/quote-product";

// Recommended complement machines to show at the bottom
const RECOMMENDED_COMPLEMENTS = [
  {
    id: "tlc-700g",
    name: "TLC 700 G (Muestras)",
    capacity: "100 g - 700 g",
    description: "Tostador compacto de muestras y perfilado de lotes.",
  },
  {
    id: "molino-martillo",
    name: "Molino a Martillo",
    capacity: "60 kg / hora",
    description: "Molienda industrial para granos y frutos secos.",
  },
  {
    id: "partidor-avellanas",
    name: "Partidor de Avellanas",
    capacity: "7 sacos / hora",
    description: "Procesamiento de frutos secos y avellana silvestre.",
  },
];

export default function QuotePageContent() {
  const { products, removeProduct, addProduct, hasProduct } = useQuoteSelection();
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const productCount = products.length;

  // Format items for WhatsApp quick action
  const formattedProductsForWa = products.map((item) => ({
    name: item.name,
    capacity: item.capacity,
    selectedColor: item.selectedColor ?? undefined,
    selectedColorId: item.selectedColorId ?? undefined,
    selectedAddOns: item.selectedAddOns?.map((addOn) => ({
      id: addOn.id,
      name: addOn.name,
    })),
  }));

  const handleWhatsAppQuote = () => {
    const url = buildQuoteWhatsAppUrl(
      "Cliente Web",
      "",
      "Hola Fica Tostadores, me gustaría cotizar oficialmente estos equipos:",
      formattedProductsForWa,
    );
    openWhatsAppContact(url);
  };

  const handleAddComplement = (comp: typeof RECOMMENDED_COMPLEMENTS[0]) => {
    const matched = defaultProducts.find((p) => p.id === comp.id);
    if (matched) {
      addProduct(buildQuoteProductItem(matched, []), false);
    }
  };

  const handleScrollToForm = () => {
    const el = document.getElementById("solicitud-cotizacion-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyReference = () => {
    if (submittedRequestId) {
      void navigator.clipboard.writeText(submittedRequestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // FULL-SCREEN SUCCESS VIEW WHEN SUBMITTED
  if (submittedRequestId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="rounded-3xl border border-white/[0.1] bg-panel/80 p-8 sm:p-14 shadow-2xl backdrop-blur-md text-center space-y-8 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange/15 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Hero Icon */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange/10 border-2 border-orange/30 text-orange shadow-xl shadow-orange/20 animate-in zoom-in-50 duration-500">
            <Check className="h-12 w-12 stroke-[3]" />
          </div>

          {/* Header Title */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange">
              Solicitud Recibida Con Éxito
            </p>

            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-wide text-steel-light">
              ¡TU COTIZACIÓN YA ESTÁ EN PROCESO!
            </h1>

            <p className="mx-auto max-w-xl text-base text-steel-mid leading-relaxed">
              Hemos registrado correctamente tu solicitud. Nuestro equipo comercial e ingeniería en la fábrica de Fica Tostadores preparará tu propuesta técnica.
            </p>
          </div>

          {/* Reference Badge */}
          <div className="inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surface/70 px-4 py-2.5 text-xs text-steel-mid">
            <span>Referencia de Seguimiento:</span>
            <strong className="font-mono text-steel-light text-sm tracking-wider">
              #{submittedRequestId}
            </strong>
            <button
              type="button"
              onClick={handleCopyReference}
              className="ml-1 p-1 text-steel-dark hover:text-orange transition-colors"
              title="Copiar referencia"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {/* Process Timeline Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="rounded-2xl border border-white/[0.06] bg-surface/40 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Paso 1</span>
              </div>
              <p className="mt-1 font-display text-base text-steel-light">
                Solicitud Registrada
              </p>
              <p className="mt-0.5 text-xs text-steel-mid">
                Sus datos y equipos quedaron guardados en sistema.
              </p>
            </div>

            <div className="rounded-2xl border border-orange/30 bg-orange/10 p-4">
              <div className="flex items-center gap-2 text-orange font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Paso 2 (Actual)</span>
              </div>
              <p className="mt-1 font-display text-base text-steel-light">
                Análisis de Fábrica
              </p>
              <p className="mt-0.5 text-xs text-steel-mid">
                Revisión de capacidad, voltajes y acabados.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-surface/40 p-4">
              <div className="flex items-center gap-2 text-steel-dark font-semibold text-xs uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                <span>Paso 3</span>
              </div>
              <p className="mt-1 font-display text-base text-steel-light">
                Envío de Propuesta
              </p>
              <p className="mt-0.5 text-xs text-steel-mid">
                Recibirás la cotización detallada por correo o WhatsApp.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleWhatsAppQuote}
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-8 text-sm font-semibold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <MessageSquare className="h-5 w-5" />
              Continuar por WhatsApp
            </button>

            <Link
              href="/productos"
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-orange px-8 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-hover shadow-lg shadow-orange/20"
            >
              Explorar Catálogo de Equipos
              <ArrowRight className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={() => setSubmittedRequestId(null)}
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl border border-white/[0.1] px-6 text-xs font-semibold uppercase tracking-wider text-steel-mid hover:text-steel-light hover:border-white/20 transition-colors"
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Navigation Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-steel-dark">
        <Link href="/" className="hover:text-steel-light transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <Link href="/productos" className="hover:text-steel-light transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-orange font-semibold">Cotizador</span>
      </nav>

      {/* Header Banner */}
      <div className="mb-10 border-b border-white/[0.08] pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange">
              Proceso de Cotización
            </p>

            <h1 className="mt-2 font-display text-4xl font-bold tracking-wide text-steel-light sm:text-5xl">
              TU SOLICITUD DE <span className="text-orange">COTIZACIÓN</span>
            </h1>

            <p className="mt-2 max-w-2xl text-base text-steel-mid">
              Revisa tus equipos seleccionados y completa tus datos para recibir una propuesta comercial y técnica personalizada directo de fábrica.
            </p>
          </div>

          <Link
            href="/productos"
            className="inline-flex items-center gap-2 rounded-xl border border-steel-dark/40 bg-panel px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver más productos
          </Link>
        </div>
      </div>

      {/* Main 2-Column E-Commerce Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Equipos + Formulario de Datos (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* SECCIÓN 1: EQUIPOS SELECCIONADOS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="font-display text-2xl uppercase tracking-wide text-steel-light flex items-center gap-3">
                <span>1. Equipos Seleccionados</span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-orange/20 px-2 text-xs font-bold text-orange border border-orange/30">
                  {productCount}
                </span>
              </h2>

              {productCount > 0 && (
                <p className="text-xs uppercase tracking-wider text-steel-dark">
                  {productCount === 1 ? "1 equipo en lista" : `${productCount} equipos en lista`}
                </p>
              )}
            </div>

            {/* Empty State */}
            {productCount === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-panel/50 p-8 text-center sm:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange/10 border border-orange/20 text-orange mb-4">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl uppercase tracking-wide text-steel-light">
                  Aún no has agregado tostadores
                </h3>
                <p className="mt-2 text-sm text-steel-mid max-w-md mx-auto">
                  Selecciona la maquinaria de tu interés desde nuestro catálogo interactivo para preparar tu cotización personalizada.
                </p>
                <Link
                  href="/productos"
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-8 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover shadow-lg shadow-orange/20"
                >
                  Explorar Catálogo Fica
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {products.map((item) => {
                  const matchedProduct = defaultProducts.find((p) => p.id === item.id);
                  const imageSrc = matchedProduct
                    ? getProductImageSrc(matchedProduct.images?.[0])
                    : null;

                  return (
                    <li
                      key={item.id}
                      className="group relative flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-panel/70 p-5 shadow-lg shadow-black/20 transition-all hover:border-orange/60 sm:flex-row sm:items-start"
                    >
                      {/* Thumbnail Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface border border-white/[0.06] mx-auto sm:mx-0">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-surface/80 text-steel-dark">
                            <FileText className="h-8 w-8 opacity-40" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-steel-light group-hover:text-orange transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs font-semibold uppercase tracking-widest text-orange mt-0.5">
                              Capacidad: {item.capacity}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProduct(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-steel-dark transition-colors hover:border-orange/40 hover:bg-orange/10 hover:text-orange shrink-0"
                            aria-label={`Quitar ${item.name}`}
                            title="Quitar de cotización"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {matchedProduct?.description && (
                          <p className="mt-1.5 text-xs text-steel-mid line-clamp-2 leading-relaxed">
                            {matchedProduct.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {item.selectedColor ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-surface px-2.5 py-1 text-xs text-steel-light font-medium">
                              <span className="h-2 w-2 rounded-full bg-orange" />
                              Color: {item.selectedColor}
                            </span>
                          ) : null}

                          {item.selectedAddOns?.map((addOn) => (
                            <span
                              key={addOn.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-orange/40 bg-orange/10 px-2.5 py-1 text-xs font-medium text-orange"
                            >
                              + {addOn.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* SECCIÓN 2: FORMULARIO DE DATOS */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-steel-light border-b border-white/[0.06] pb-3">
              2. Datos del Solicitante
            </h2>

            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-2xl border border-white/[0.06] bg-panel/40" />
              }
            >
              <ContactForm
                formId="solicitud-cotizacion-form"
                hideSubmitButton={true}
                onSuccess={(id) => setSubmittedRequestId(id || "solicitud-registrada")}
              />
            </Suspense>
          </section>

          {/* SECCIÓN 3: COMPLEMENTOS RECOMENDADOS */}
          <section className="pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-orange" />
              <h3 className="font-display text-lg uppercase tracking-wider text-steel-light">
                Equipos Complementarios Recomendados
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {RECOMMENDED_COMPLEMENTS.map((comp) => {
                const added = hasProduct(comp.id);
                return (
                  <div
                    key={comp.id}
                    className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-panel/40 p-4 transition-all hover:border-steel-dark/40"
                  >
                    <div>
                      <h4 className="font-display text-base uppercase text-steel-light">
                        {comp.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-orange uppercase tracking-wider mt-0.5">
                        {comp.capacity}
                      </p>
                      <p className="mt-1 text-xs text-steel-mid line-clamp-2">
                        {comp.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={added}
                      onClick={() => handleAddComplement(comp)}
                      className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                        added
                          ? "border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 cursor-default"
                          : "border border-orange/40 text-orange hover:bg-orange/10 hover:border-orange"
                      }`}
                    >
                      {added ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          En Cotización
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Agregar a lista
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            {/* Clean Summary Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-panel p-6 shadow-xl shadow-black/40">
              <h2 className="font-display text-2xl uppercase tracking-wide text-steel-light border-b border-white/[0.08] pb-4">
                Resumen de Cotización
              </h2>

              {/* Items List Summary */}
              {productCount > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-steel-dark">
                    Equipos en tu lista ({productCount}):
                  </p>
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-surface/60 px-3 py-2 text-xs"
                      >
                        <span className="font-display uppercase text-steel-light truncate">
                          {p.name}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase text-orange">
                          {p.capacity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-xs text-steel-mid">
                  No hay equipos en la cotización.
                </p>
              )}

              <ul className="mt-4 divide-y divide-white/[0.06] text-xs">
                <li className="flex justify-between py-2 text-steel-mid">
                  <span>Asesoría de ingeniería y tueste:</span>
                  <span className="text-emerald-400 font-medium">Sin costo</span>
                </li>
                <li className="flex justify-between py-2 text-steel-mid">
                  <span>Respuesta comercial estimada:</span>
                  <span className="text-steel-light font-medium">&lt; 24 hrs hábiles</span>
                </li>
              </ul>

              {/* Trust Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-surface/50 p-3 text-center text-[11px]">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-5 w-5 text-orange" />
                  <span className="text-steel-light font-medium leading-tight">Garantía 2 Años</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Wrench className="h-5 w-5 text-orange" />
                  <span className="text-steel-light font-medium leading-tight">Soporte Técnico</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="h-5 w-5 text-orange" />
                  <span className="text-steel-light font-medium leading-tight">Despacho Especial</span>
                </div>
              </div>

              {/* Primary Form Submit / WhatsApp Actions */}
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  form="solicitud-cotizacion-form"
                  onClick={handleScrollToForm}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange px-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-hover shadow-lg shadow-orange/20"
                >
                  <Send className="h-4 w-4" />
                  Enviar Solicitud
                </button>

                {productCount > 0 && (
                  <button
                    type="button"
                    onClick={handleWhatsAppQuote}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 text-xs font-semibold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Cotizar Directo por WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
