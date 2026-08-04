"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
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
}

export default function ProductQuoteActions({
  productId,
  productName,
  productCapacity,
  addOns,
  selectedColor,
  selectedColorId,
}: ProductQuoteActionsProps) {
  const { addProduct, hasProduct, products, openDrawer } = useQuoteSelection();
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const alreadySelected = hasProduct(productId);
  const hasAddOns = addOns.length > 0;

  useEffect(() => {
    const existing = products.find((p) => p.id === productId);
    if (existing?.selectedAddOns) {
      setSelectedAddOnIds(existing.selectedAddOns.map((a) => a.id));
    }
  }, [products, productId]);

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
    addProduct(buildSelection(selectedAddOnIds), true);
  }

  return (
    <div className="mt-12 space-y-6">
      {/* Inline Non-Intrusive Add-Ons Selection */}
      {hasAddOns && (
        <div className="rounded-2xl border border-white/[0.08] bg-panel/60 p-5 shadow-lg shadow-black/20">
          <p className="font-display text-lg uppercase tracking-wide text-steel-light">
            Agregados Opcionales
          </p>
          <p className="mt-1 text-xs text-steel-mid">
            Seleccione los accesorios que desea incluir en su cotización para{" "}
            <span className="text-orange font-semibold">{productName}</span>:
          </p>

          <QuoteAddOnSelector
            addOns={addOns}
            selectedIds={selectedAddOnIds}
            onChange={(ids) => {
              setSelectedAddOnIds(ids);
              if (alreadySelected) {
                addProduct(buildSelection(ids), false);
              }
            }}
            className="mt-4"
          />
        </div>
      )}

      {/* Primary Actions Bar */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleAddOrUpdate}
          className={`inline-flex h-14 min-w-[16rem] items-center justify-center gap-2.5 rounded-xl px-8 text-sm font-semibold uppercase tracking-wider transition-all shadow-lg ${
            alreadySelected
              ? "border border-emerald-500/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/10"
              : "bg-orange text-white hover:bg-orange-hover shadow-orange/20"
          }`}
        >
          {alreadySelected ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              En tu cotización (Ver Lista)
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
