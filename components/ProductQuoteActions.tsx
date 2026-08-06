"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";
import type { ProductAddOn } from "@/lib/products";
import { buildQuoteProductItem } from "@/lib/quote-product";
import { useQuoteSelection } from "@/lib/quote-selection";
import QuoteAddOnSelector from "./QuoteAddOnSelector";

interface ProductQuoteActionsProps {
  productId: string;
  productName: string;
  productCapacity: string;
  addOns: ProductAddOn[];
  selectedColor?: string | null;
  selectedColorId: string;
  isOutOfStock?: boolean;
  compact?: boolean;
}

export default function ProductQuoteActions({
  productId,
  productName,
  productCapacity,
  addOns,
  selectedColor,
  selectedColorId,
  isOutOfStock = false,
  compact = false,
}: ProductQuoteActionsProps) {
  const { addProduct, hasProduct, products, openDrawer } = useQuoteSelection();
  const [localAddOnIds, setLocalAddOnIds] = useState<string[] | null>(null);

  const quoteAddOnIds = useMemo(() => {
    const existing = products.find((p) => p.id === productId);
    return existing?.selectedAddOns?.map((a) => a.id) ?? [];
  }, [products, productId]);

  const selectedAddOnIds = localAddOnIds ?? quoteAddOnIds;
  const alreadySelected = hasProduct(productId);
  const hasAddOns = addOns.length > 0;

  function buildSelection(selectedIds: string[]) {
    return buildQuoteProductItem(
      {
        id: productId,
        name: productName,
        capacity: productCapacity,
        addOns,
      },
      selectedIds,
      { id: selectedColorId, name: selectedColor },
    );
  }

  function handleAddOrUpdate() {
    if (isOutOfStock) return;
    addProduct(buildSelection(selectedAddOnIds), true);
    if (alreadySelected) {
      openDrawer();
    }
  }

  function handleAddOnChange(ids: string[]) {
    if (isOutOfStock) return;
    setLocalAddOnIds(ids);
    if (alreadySelected) {
      addProduct(buildSelection(ids), false);
    }
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {hasAddOns && !isOutOfStock ? (
          <div className="rounded-xl border border-white/[0.06] bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-dark">
              Agregados
            </p>
            <QuoteAddOnSelector
              addOns={addOns}
              selectedIds={selectedAddOnIds}
              onChange={handleAddOnChange}
              className="mt-3"
            />
          </div>
        ) : null}

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddOrUpdate}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold uppercase tracking-wider transition-all active:scale-[0.98] ${
            isOutOfStock
              ? "border border-red-500/30 bg-red-500/10 text-red-400 opacity-80 cursor-not-allowed"
              : alreadySelected
                ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                : "bg-orange text-white shadow-lg shadow-orange/15 hover:bg-orange-hover"
          }`}
        >
          {isOutOfStock ? (
            <>
              <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.75} />
              Agotado (Sin Stock)
            </>
          ) : alreadySelected ? (
            <>
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
              En cotización
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              Cotizar
            </>
          )}
        </button>

        <Link
          href="/productos"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-background/30 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange/40 hover:text-orange"
        >
          Ver más productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-6">
      {hasAddOns && !isOutOfStock ? (
        <div className="rounded-2xl border border-white/[0.08] bg-panel/60 p-5 shadow-lg shadow-black/20">
          <p className="font-display text-lg uppercase tracking-wide text-steel-light">
            Agregados Opcionales
          </p>
          <p className="mt-1 text-xs text-steel-mid">
            Seleccione los accesorios que desea incluir en su cotización para{" "}
            <span className="font-semibold text-orange">{productName}</span>:
          </p>

          <QuoteAddOnSelector
            addOns={addOns}
            selectedIds={selectedAddOnIds}
            onChange={handleAddOnChange}
            className="mt-4"
          />
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddOrUpdate}
          className={`inline-flex h-14 min-w-[16rem] items-center justify-center gap-2.5 rounded-xl px-8 text-sm font-semibold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
            isOutOfStock
              ? "border border-red-500/40 bg-red-500/10 text-red-400 opacity-80 cursor-not-allowed"
              : alreadySelected
                ? "border border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10 hover:bg-emerald-500/20"
                : "bg-orange text-white shadow-orange/20 hover:bg-orange-hover"
          }`}
        >
          {isOutOfStock ? (
            <>
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Agotado (Sin Stock)
            </>
          ) : alreadySelected ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              En tu cotización
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" />
              Agregar a Cotización
            </>
          )}
        </button>

        <Link
          href="/productos"
          className="inline-flex h-14 items-center justify-center rounded-xl border border-steel-mid/40 bg-panel/40 px-8 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
        >
          Ver más productos
        </Link>
      </div>
    </div>
  );
}
