"use client";

import { ExternalLink, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import ProductForm from "@/components/admin/ProductForm";
import SteelPanel from "@/components/SteelPanel";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import type { Product } from "@/lib/products";

interface ProductDetailAdminEditProps {
  product: Product;
  children: ReactNode;
}

export default function ProductDetailAdminEdit({
  product,
  children,
}: ProductDetailAdminEditProps) {
  const router = useRouter();
  const { isStaff, loading } = useFirebaseAuth();
  const [editing, setEditing] = useState(false);

  if (loading || !isStaff) {
    return <>{children}</>;
  }

  function handleSaved() {
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-orange/30 bg-orange/5 px-4 py-3 md:px-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-orange">
              Modo edición
            </p>
            <p className="mt-1 text-sm text-steel-mid">
              Modificando{" "}
              <span className="text-steel-light">{product.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-steel-mid/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
          >
            <X className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>

        <SteelPanel className="p-6 md:p-8">
          <ProductForm
            mode="edit"
            initialProduct={product}
            onSaved={handleSaved}
            onCancel={() => setEditing(false)}
            cancelLabel="Cancelar edición"
          />
        </SteelPanel>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar producto
        </button>
        <Link
          href={`/admin/productos/${product.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-steel-mid/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange hover:text-orange"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Panel admin
        </Link>
      </div>
      {children}
    </>
  );
}
