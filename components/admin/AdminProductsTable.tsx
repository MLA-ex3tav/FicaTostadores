"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Eye, ImageIcon, Package, Pencil, Plus, Search, Square, Trash2, X } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { getCatalogLabel, type CatalogConfig } from "@/lib/catalog-config";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getCategoryLabel } from "@/lib/product-categories";
import type { Product } from "@/lib/products";

interface AdminProductsTableProps {
  products: Product[];
  catalogConfig: CatalogConfig;
}

export default function AdminProductsTable({
  products,
  catalogConfig,
}: AdminProductsTableProps) {
  const router = useRouter();
  const { adminFetch } = useFirebaseAuth();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in-stock" | "out-of-stock" | "promo" | "featured"
  >("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkLoading, setBulkLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter === "in-stock") {
      result = result.filter((p) => !p.isOutOfStock);
    } else if (statusFilter === "out-of-stock") {
      result = result.filter((p) => Boolean(p.isOutOfStock));
    } else if (statusFilter === "promo") {
      result = result.filter((p) => Boolean(p.isPromo));
    } else if (statusFilter === "featured") {
      result = result.filter((p) => Boolean(p.isFeatured));
    }

    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return result;
    }

    return result.filter((product) => {
      const catalogLabel = getCatalogLabel(product.catalog, catalogConfig);
      const categoryLabel = getCategoryLabel(
        product.category,
        catalogConfig,
      );

      return [
        product.name,
        product.id,
        catalogLabel,
        categoryLabel,
        product.capacity,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [products, catalogConfig, query, statusFilter]);

  const filteredIds = useMemo(
    () => filteredProducts.map((product) => product.id),
    [filteredProducts],
  );

  const selectedVisibleCount = filteredIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allVisibleSelected =
    filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);

      for (const id of filteredIds) {
        if (allVisibleSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }

      return next;
    });
  }

  function toggleId(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;

    if (count === 0) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar ${count} producto${count === 1 ? "" : "s"} del catálogo? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setBulkLoading(true);

    try {
      const response = await adminFetch("/api/admin/products/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "No se pudieron eliminar los productos.");
        return;
      }

      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Selection Tools */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar entre ${products.length} productos…`}
            aria-label="Buscar productos"
            className="industrial-input h-12 pl-10 pr-10 text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel-mid transition-colors hover:text-orange"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-white/[0.08] bg-panel/40 p-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === "all"
                ? "bg-orange text-white"
                : "text-steel-mid hover:text-steel-light"
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in-stock")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === "in-stock"
                ? "bg-emerald-600 text-white"
                : "text-steel-mid hover:text-emerald-400"
            }`}
          >
            Disponibles ({products.filter((p) => !p.isOutOfStock).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("out-of-stock")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === "out-of-stock"
                ? "bg-red-600 text-white"
                : "text-steel-mid hover:text-red-400"
            }`}
          >
            Agotados ({products.filter((p) => p.isOutOfStock).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("promo")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === "promo"
                ? "bg-amber-600 text-white"
                : "text-steel-mid hover:text-amber-400"
            }`}
          >
            Promos ({products.filter((p) => p.isPromo).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("featured")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              statusFilter === "featured"
                ? "bg-orange text-white"
                : "text-steel-mid hover:text-orange"
            }`}
          >
            Destacados ({products.filter((p) => p.isFeatured).length})
          </button>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          disabled={filteredProducts.length === 0}
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-steel-dark/30 bg-panel/60 px-4 text-xs font-semibold uppercase tracking-wider text-steel-light transition-all hover:border-orange/40 hover:text-orange disabled:opacity-50"
        >
          {allVisibleSelected ? (
            <Check className="h-4 w-4 text-orange" aria-hidden />
          ) : (
            <Square className="h-4 w-4 text-steel-dark" aria-hidden />
          )}
          {allVisibleSelected ? "Quitar selección" : "Seleccionar todos"}
        </button>
      </div>

      {/* Selected Items Floating Action Bar */}
      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange/30 bg-orange/10 px-5 py-3.5 shadow-lg shadow-orange/10 animate-in fade-in duration-200">
          <p className="text-sm font-semibold uppercase tracking-wider text-steel-light flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-orange text-white text-xs font-bold px-2">
              {selectedIds.size}
            </span>
            <span>{selectedIds.size === 1 ? "producto seleccionado" : "productos seleccionados"}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              disabled={bulkLoading}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-surface/60 px-4 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-white/20 hover:text-steel-light disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              disabled={bulkLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-red-500 shadow-md shadow-red-600/20 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {bulkLoading
                ? "Eliminando…"
                : `Eliminar (${selectedIds.size})`}
            </button>
          </div>
        </div>
      ) : null}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-panel/40 px-6 py-14 text-center">
          {query ? (
            <>
              <p className="font-display text-xl uppercase tracking-wide text-steel-light">
                Sin resultados
              </p>
              <p className="mt-1.5 text-sm text-steel-mid">
                No hay productos que coincidan con «<strong className="text-steel-light">{query}</strong>».
              </p>
            </>
          ) : (
            <>
              <Package className="mx-auto h-12 w-12 text-steel-dark" aria-hidden />
              <p className="mt-3 font-display text-xl uppercase tracking-wide text-steel-light">
                Aún no hay productos
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-steel-mid">
                Agrega tu primer equipo. Después podrás editarlo, añadirle fotos y organizarlo por catálogo.
              </p>
              <Link
                href="/admin/productos/nuevo"
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover shadow-lg shadow-orange/20"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Agregar producto
              </Link>
            </>
          )}
        </div>
      ) : (
        /* Products Table - Full Width, No Outer Box */
        <div className="w-full overflow-x-auto border-t border-b border-white/[0.08]">
          <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.08] bg-surface/80 text-xs font-semibold uppercase tracking-wider text-steel-mid">
                <tr>
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      aria-label="Seleccionar todos los productos"
                      className="size-4 accent-orange cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5 font-semibold">Producto</th>
                  <th className="px-4 py-3.5 font-semibold">Catálogo</th>
                  <th className="px-4 py-3.5 font-semibold">Categoría</th>
                  <th className="px-4 py-3.5 font-semibold">Estado y Promos</th>
                  <th className="px-4 py-3.5 font-semibold">Imágenes</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredProducts.map((product) => {
                  const thumbnail =
                    product.images?.[0]?.product?.src ??
                    product.images?.[0]?.carousel?.src ??
                    null;
                  const imageCount = product.images?.length ?? 0;
                  const selected = selectedIds.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors hover:bg-white/[0.02] ${
                        selected ? "bg-orange/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleId(product.id)}
                          aria-label={`Seleccionar ${product.name}`}
                          className="size-4 accent-orange cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3.5">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={product.name}
                              className="h-12 w-16 shrink-0 rounded-xl border border-white/[0.08] bg-surface object-cover"
                            />
                          ) : (
                            <span className="grid h-12 w-16 shrink-0 place-items-center rounded-xl border border-dashed border-white/[0.1] bg-surface/60 text-steel-dark">
                              <ImageIcon className="h-5 w-5 opacity-40" aria-hidden />
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/productos/${product.id}`}
                              className="font-display text-base font-bold uppercase tracking-wide text-steel-light hover:text-orange transition-colors truncate block"
                            >
                              {product.name}
                            </Link>
                            <p className="truncate font-mono text-xs text-steel-dark mt-0.5">
                              {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg border border-orange/30 bg-orange/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-orange">
                          {getCatalogLabel(product.catalog, catalogConfig)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1 text-xs font-medium text-steel-mid">
                          {getCategoryLabel(product.category, catalogConfig)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {product.isOutOfStock ? (
                            <span className="rounded-lg border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
                              Agotado
                            </span>
                          ) : (
                            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-emerald-400">
                              En Stock
                            </span>
                          )}

                          {product.isPromo ? (
                            <span className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                              {product.promoTag ? `PROMO: ${product.promoTag}` : "PROMO"}
                            </span>
                          ) : null}

                          {product.disableColors ? (
                            <span className="rounded-lg border border-white/[0.06] bg-surface px-2 py-0.5 text-[10px] text-steel-dark">
                              Sin color
                            </span>
                          ) : product.disabledColors && product.disabledColors.length > 0 ? (
                            <span className="rounded-lg border border-orange/20 bg-orange/5 px-2 py-0.5 text-[10px] text-orange">
                              {product.disabledColors.length} col. bloqueados
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1 text-xs text-steel-mid">
                          <ImageIcon className="h-3.5 w-3.5 text-steel-dark" />
                          {imageCount > 0
                            ? `${imageCount} foto${imageCount === 1 ? "" : "s"}`
                            : "Sin fotos"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange/50 hover:bg-orange/10"
                            title="Editar producto"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Link>
                          <Link
                            href={`/productos/${product.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-white/20 hover:text-steel-light"
                            title="Ver en tienda"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
