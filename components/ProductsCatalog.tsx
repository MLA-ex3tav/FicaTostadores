"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  getCategoriesForCatalog,
  shouldShowCategoryForCatalog,
} from "@/lib/product-categories";
import type { CatalogConfig } from "@/lib/catalog-config";
import type { Product } from "@/lib/products";

interface ProductsCatalogProps {
  products: Product[];
  catalogConfig: CatalogConfig;
}

type SubFilterId = string | "all";

const PRODUCTS_PER_PAGE = 15;

const filterButtonClass = (isActive: boolean) =>
  `rounded-lg border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
    isActive
      ? "border-orange bg-orange text-white"
      : "border-steel-dark/40 text-steel-mid hover:border-orange hover:text-orange"
  }`;

function parseCatalog(value: string | null, config: CatalogConfig): string {
  if (value && config.catalogs.some((catalog) => catalog.id === value)) {
    return value;
  }

  return config.catalogs[0]?.id ?? "cafe";
}

function parseSubFilter(
  value: string | null,
  catalogId: string,
  config: CatalogConfig,
): SubFilterId {
  if (!value || value === "all") {
    return "all";
  }

  const validCategories = getCategoriesForCatalog(catalogId, config).map(
    (category) => category.id,
  );

  if (validCategories.includes(value)) {
    return value;
  }

  return "all";
}

function parsePage(value: string | null, totalPages: number): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  if (totalPages > 0 && parsed > totalPages) {
    return totalPages;
  }

  return parsed;
}

export default function ProductsCatalog({
  products,
  catalogConfig,
}: ProductsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const catalog = parseCatalog(searchParams.get("catalog"), catalogConfig);
  const subFilter = parseSubFilter(
    searchParams.get("tipo"),
    catalog,
    catalogConfig,
  );

  const catalogProducts = products.filter((product) => product.catalog === catalog);
  const subCategories = getCategoriesForCatalog(catalog, catalogConfig);
  const showSubFilters = shouldShowCategoryForCatalog(catalog, catalogConfig);

  const filtered =
    subFilter === "all" || !showSubFilters
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === subFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = parsePage(searchParams.get("pagina"), totalPages);
  const pageStart = (page - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filtered.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);

  function updateSearchParams(
    nextCatalog: string,
    nextSubFilter: SubFilterId,
    nextPage = 1,
  ) {
    const params = new URLSearchParams();
    params.set("catalog", nextCatalog);

    if (nextSubFilter !== "all" && showSubFilters) {
      params.set("tipo", nextSubFilter);
    }

    if (nextPage > 1) {
      params.set("pagina", String(nextPage));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleCatalogChange(nextCatalog: string) {
    updateSearchParams(nextCatalog, "all", 1);
  }

  function handleSubFilterChange(nextSubFilter: SubFilterId) {
    updateSearchParams(catalog, nextSubFilter, 1);
  }

  function handlePageChange(nextPage: number) {
    updateSearchParams(catalog, subFilter, nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {catalogConfig.catalogs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleCatalogChange(item.id)}
            aria-pressed={catalog === item.id}
            className={filterButtonClass(catalog === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showSubFilters && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSubFilterChange("all")}
            aria-pressed={subFilter === "all"}
            className={filterButtonClass(subFilter === "all")}
          >
            Todos
          </button>
          {subCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSubFilterChange(category.id)}
              aria-pressed={subFilter === category.id}
              className={filterButtonClass(subFilter === category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-6 text-sm text-steel-dark">
        {filtered.length} {filtered.length === 1 ? "equipo" : "equipos"}
        {totalPages > 1 ? (
          <>
            {" "}
            · Página {page} de {totalPages}
          </>
        ) : null}
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            catalogConfig={catalogConfig}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          aria-label="Paginación del catálogo"
        >
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-steel-dark/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-steel-mid">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-steel-dark/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </>
  );
}

