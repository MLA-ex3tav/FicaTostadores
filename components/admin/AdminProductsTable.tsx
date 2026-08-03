"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageIcon, Package, Plus, Search, X } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { getCatalogLabel, type CatalogConfig } from "@/lib/catalog-config";
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
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return products;
    }

    return products.filter((product) => {
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
  }, [products, catalogConfig, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar entre ${products.length} productos…`}
            aria-label="Buscar productos"
            className="industrial-input pl-9 pr-9 text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-mid transition-colors hover:text-orange"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-steel-dark/30 bg-[var(--input-bg)] px-6 py-14 text-center">
          {query ? (
            <>
              <p className="font-display text-lg text-steel-light">
                Sin resultados
              </p>
              <p className="mt-1 text-sm text-steel-mid">
                No hay productos que coincidan con «{query}».
              </p>
            </>
          ) : (
            <>
              <Package className="mx-auto h-8 w-8 text-steel-dark" aria-hidden />
              <p className="mt-3 font-display text-lg text-steel-light">
                Aún no hay productos
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-steel-mid">
                Agrega tu primer equipo. Después podrás editarlo, añadirle fotos
                y organizarlo por catálogo.
              </p>
              <Link
                href="/admin/productos/nuevo"
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Agregar producto
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Catálogo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Imágenes</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const thumbnail =
                  product.images?.[0]?.product?.src ??
                  product.images?.[0]?.carousel?.src ??
                  null;
                const imageCount = product.images?.length ?? 0;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt=""
                            className="h-11 w-14 shrink-0 rounded-lg border border-white/[0.06] object-cover"
                          />
                        ) : (
                          <span className="grid h-11 w-14 shrink-0 place-items-center rounded-lg border border-dashed border-steel-dark/30 bg-background/40 text-steel-dark">
                            <ImageIcon className="h-4 w-4" aria-hidden />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-display text-base text-steel-light">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-steel-dark">
                            {product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-steel-dark/25 bg-background/40 px-2.5 py-1 text-xs text-steel-mid">
                        {getCatalogLabel(product.catalog, catalogConfig)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-steel-mid">
                      {getCategoryLabel(product.category, catalogConfig)}
                    </td>
                    <td className="px-4 py-4 text-steel-mid">
                      {imageCount > 0
                        ? `${imageCount} foto${imageCount === 1 ? "" : "s"}`
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="text-xs font-medium text-orange transition-colors hover:text-orange-hover"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/productos/${product.id}`}
                          className="text-xs text-steel-mid transition-colors hover:text-orange"
                        >
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
