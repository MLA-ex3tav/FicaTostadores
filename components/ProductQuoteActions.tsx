"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuoteSelection } from "@/lib/quote-selection";
import SteelPanel from "./SteelPanel";

interface ProductQuoteActionsProps {
  productId: string;
  productName: string;
  productCapacity: string;
}

export default function ProductQuoteActions({
  productId,
  productName,
  productCapacity,
}: ProductQuoteActionsProps) {
  const router = useRouter();
  const { addProduct, hasProduct } = useQuoteSelection();
  const [modalOpen, setModalOpen] = useState(false);
  const alreadySelected = hasProduct(productId);

  function handleConsultClick() {
    addProduct({
      id: productId,
      name: productName,
      capacity: productCapacity,
    });
    setModalOpen(true);
  }

  return (
    <>
      <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleConsultClick}
          className={`inline-flex items-center justify-center rounded-xl px-10 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
            alreadySelected
              ? "border border-orange/60 text-orange hover:border-orange hover:bg-orange/10"
              : "bg-orange text-white hover:bg-orange-hover"
          }`}
        >
          {alreadySelected
            ? "En su cotización"
            : "Consultar por este producto"}
        </button>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center rounded-xl border border-steel-mid/40 px-10 py-3.5 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
        >
          Ver más productos
        </Link>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
        >
          <SteelPanel className="w-full max-w-md">
            <p
              id="quote-modal-title"
              className="font-display text-xl tracking-wide text-steel-light"
            >
              Producto en su cotización
            </p>
            <p className="mt-3 text-sm leading-relaxed text-steel-mid">
              <span className="text-orange">{productName}</span> quedó seleccionado.
              Puede seguir viendo más equipos o ir a completar la consulta.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                }}
                className="flex-1 rounded-xl border border-steel-mid/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
              >
                Seguir viendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  router.push("/contacto");
                }}
                className="flex-1 rounded-xl bg-orange px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
              >
                Ir a cotizar
              </button>
            </div>
          </SteelPanel>
        </div>
      )}
    </>
  );
}
