"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  getCategoriesForCatalog,
  type ProductCategory,
} from "@/lib/product-categories";
import {
  productCatalogs,
  type ProductCatalog,
} from "@/lib/product-catalogs";
import { products } from "@/lib/products";

type SubFilterId = ProductCategory | "all";

const filterButtonClass = (isActive: boolean) =>
  `rounded-lg border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
    isActive
      ? "border-orange bg-orange text-white"
      : "border-steel-dark/40 text-steel-mid hover:border-orange hover:text-orange"
  }`;

function parseCatalog(value: string | null): ProductCatalog {
  return value === "frutos" ? "frutos" : "cafe";
}

function parseSubFilter(
  value: string | null,
  catalog: ProductCatalog,
): SubFilterId {
  if (!value || value === "all") {
    return "all";
  }

  const validCategories = getCategoriesForCatalog(catalog).map(
    (category) => category.id,
  );

  if (validCategories.includes(value as ProductCategory)) {
    return value as ProductCategory;
  }

  return "all";
}

export default function ProductsCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const catalog = parseCatalog(searchParams.get("catalog"));
  const subFilter = parseSubFilter(searchParams.get("tipo"), catalog);

  const catalogProducts = products.filter((product) => product.catalog === catalog);
  const subCategories = getCategoriesForCatalog(catalog);

  const filtered =
    subFilter === "all" || catalog === "cafe"
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === subFilter);

  function updateSearchParams(nextCatalog: ProductCatalog, nextSubFilter: SubFilterId) {
    const params = new URLSearchParams();
    params.set("catalog", nextCatalog);

    if (nextSubFilter !== "all" && nextCatalog !== "cafe") {
      params.set("tipo", nextSubFilter);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleCatalogChange(nextCatalog: ProductCatalog) {
    updateSearchParams(nextCatalog, "all");
  }

  function handleSubFilterChange(nextSubFilter: SubFilterId) {
    updateSearchParams(catalog, nextSubFilter);
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {productCatalogs.map((item) => (
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

      {subCategories.length > 1 && (
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
