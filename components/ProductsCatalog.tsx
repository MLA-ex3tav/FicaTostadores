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

  function updateSearchParams(nextCatalog: string, nextSubFilter: SubFilterId) {
    const params = new URLSearchParams();
    params.set("catalog", nextCatalog);

    if (nextSubFilter !== "all" && showSubFilters) {
      params.set("tipo", nextSubFilter);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleCatalogChange(nextCatalog: string) {
    updateSearchParams(nextCatalog, "all");
  }

  function handleSubFilterChange(nextSubFilter: SubFilterId) {
    updateSearchParams(catalog, nextSubFilter);
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
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            catalogConfig={catalogConfig}
          />
        ))}
      </div>
    </>
  );
}
