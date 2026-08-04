"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { defaultProducts } from "@/lib/products";
import { getProductImageSrc } from "@/lib/product-images";
import { buildQuoteWhatsAppUrl, openWhatsAppContact } from "@/lib/quoting";
import { useQuoteSelection } from "@/lib/quote-selection";

export default function QuoteDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { products, removeProduct, clearProducts, isDrawerOpen, closeDrawer } =
    useQuoteSelection();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer when navigating to checkout pages
  useEffect(() => {
    if (pathname === "/contacto" || pathname === "/cotizar") {
      closeDrawer();
    }
  }, [pathname, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!mounted) return;
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, mounted]);

  if (!mounted) return null;

  const productCount = products.length;

  // Build product line info for WhatsApp button
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

  const handleWhatsAppClick = () => {
    const url = buildQuoteWhatsAppUrl(
      "Cliente Web",
      "",
      "Hola, me gustaría cotizar estos equipos que seleccioné en la tienda:",
      formattedProductsForWa,
    );
    openWhatsAppContact(url);
    closeDrawer();
  };

  const handleCheckoutClick = () => {
    closeDrawer();
    router.push("/cotizar");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panel de Cotización"
        className={`fixed inset-y-0 right-0 z-[101] flex w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#0E1215] shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 bg-panel/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/15 text-orange border border-orange/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-steel-light">
                Tu Cotización
              </h2>
              <p className="text-xs uppercase tracking-widest text-steel-dark">
                {productCount} {productCount === 1 ? "equipo seleccionado" : "equipos seleccionados"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {productCount > 0 && (
              <button
                type="button"
                onClick={clearProducts}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs uppercase tracking-wider text-steel-dark transition-colors hover:bg-white/[0.04] hover:text-orange"
                title="Vaciar lista"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-steel-mid transition-colors hover:border-orange/40 hover:bg-orange/10 hover:text-white"
              aria-label="Cerrar panel de cotización"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {productCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.06] text-steel-dark mb-4">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="font-display text-2xl uppercase tracking-wide text-steel-light">
                Tu lista está vacía
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-mid max-w-xs">
                Explora nuestro catálogo de tostadores industriales y máquinas de procesamiento para agregarlos a tu cotización.
              </p>
              <Link
                href="/productos"
                onClick={closeDrawer}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-6 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover shadow-lg shadow-orange/20"
              >
                Ver Catálogo de Equipos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {products.map((item) => {
                const matchedProduct = defaultProducts.find(
                  (p) => p.id === item.id,
                );
                const imageSrc = matchedProduct
                  ? getProductImageSrc(matchedProduct.images?.[0])
                  : null;

                return (
                  <li
                    key={item.id}
                    className="relative flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-panel/70 p-4 transition-all hover:border-steel-dark/40"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface border border-white/[0.06]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface/80 text-steel-dark">
                          <FileText className="h-8 w-8 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-xl uppercase tracking-wide text-steel-light truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeProduct(item.id)}
                          className="shrink-0 p-1 text-steel-dark transition-colors hover:text-orange"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-orange">
                        {item.capacity}
                      </p>

                      {item.selectedColor ? (
                        <p className="mt-1 text-xs text-steel-mid flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-orange/80 inline-block" />
                          Color: <strong className="text-steel-light">{item.selectedColor}</strong>
                        </p>
                      ) : null}

                      {item.selectedAddOns && item.selectedAddOns.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.selectedAddOns.map((addOn) => (
                            <span
                              key={addOn.id}
                              className="inline-flex items-center gap-1 rounded-md border border-orange/30 bg-orange/10 px-2 py-0.5 text-[11px] font-medium text-orange"
                            >
                              + {addOn.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer (Actions) */}
        {productCount > 0 && (
          <div className="border-t border-white/[0.08] bg-panel/90 px-6 py-5 space-y-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-steel-mid">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Atención directa por la fábrica Fica
              </span>
              <span className="font-semibold uppercase tracking-wider text-steel-light">
                {productCount} {productCount === 1 ? "equipo" : "equipos"}
              </span>
            </div>

            <div className="grid gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-hover shadow-lg shadow-orange/20"
              >
                Enviar Cotización
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 text-sm font-semibold uppercase tracking-wider text-emerald-400 transition-all hover:border-emerald-500 hover:bg-emerald-500/20"
              >
                <MessageSquare className="h-4 w-4" />
                Cotizar Rápido por WhatsApp
              </button>
            </div>

            <p className="text-center text-[11px] text-steel-dark">
              Respuesta en menos de 24 horas hábiles · Envíos a todo Chile e Internacional
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
