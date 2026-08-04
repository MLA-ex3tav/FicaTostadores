"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Filter, Layers } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { sectionEyebrowClass } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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

const catalogTabTriggerClass =
  "h-auto shrink-0 flex-none rounded-none bg-transparent px-1 pb-3 pt-1 font-display text-base tracking-wide shadow-none border-b-2 border-transparent -mb-px data-active:border-orange data-active:bg-transparent data-active:text-steel-light data-active:shadow-none after:!hidden";

const catalogTabsScrollerClass =
  "-mx-4 overflow-x-auto overflow-y-hidden overscroll-y-none px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden";

const chipScrollerClass =
  "flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

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

  const catalogProducts = products.filter(
    (product) => product.catalog === catalog,
  );
  const subCategories = getCategoriesForCatalog(catalog, catalogConfig);
  const showSubFilters = shouldShowCategoryForCatalog(catalog, catalogConfig);

  const filtered =
    subFilter === "all" || !showSubFilters
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === subFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = parsePage(searchParams.get("pagina"), totalPages);
  const pageStart = (page - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filtered.slice(
    pageStart,
    pageStart + PRODUCTS_PER_PAGE,
  );

  const catalogCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.catalog, (counts.get(product.catalog) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

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
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <aside
        className="hidden lg:block"
        aria-label="Filtros del catálogo"
      >
        <div className="lg:sticky lg:top-24 space-y-8 rounded-2xl border border-steel-dark/25 bg-panel/75 backdrop-blur-md p-5 shadow-2xl heat-glow">
          <nav aria-label="Catálogos">
            <div className="flex items-center gap-2 border-b border-steel-dark/15 pb-2.5 mb-3">
              <Filter className="h-4 w-4 text-orange" />
              <p className="text-xs font-bold uppercase tracking-widest text-steel-light">Catálogos</p>
            </div>
            <ul className="space-y-1.5">
              {catalogConfig.catalogs.map((item) => {
                const isActive = catalog === item.id;
                const count = catalogCounts.get(item.id) ?? 0;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleCatalogChange(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-orange/15 text-orange border-l-4 border-orange font-semibold rounded-r-xl rounded-l-xs shadow-sm"
                          : "text-steel-mid hover:bg-surface/80 hover:text-white rounded-xl",
                      )}
                    >
                      <span className="font-medium truncate">{item.label}</span>
                      {isActive ? (
                        <Check className="h-4 w-4 shrink-0 text-orange" aria-hidden />
                      ) : count > 0 ? (
                        <span className="rounded-full bg-steel-dark/15 px-2 py-0.5 text-[11px] font-mono font-medium text-steel-mid">
                          {count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {showSubFilters ? (
            <nav aria-label="Tipos de equipo">
              <div className="flex items-center gap-2 border-b border-steel-dark/15 pb-2.5 mb-3">
                <Layers className="h-4 w-4 text-orange" />
                <p className="text-xs font-bold uppercase tracking-widest text-steel-light">Tipos de Equipo</p>
              </div>
              <ul className="space-y-1.5">
                {[{ id: "all", label: "Todos los tipos", description: "" }, ...subCategories].map(
                  (category) => {
                    const isActive = subFilter === category.id;
                    const count =
                      category.id === "all"
                        ? catalogProducts.length
                        : categoryCounts.get(category.id) ?? 0;

                    return (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() =>
                            handleSubFilterChange(category.id as SubFilterId)
                          }
                          aria-pressed={isActive}
                          className={cn(
                            "block w-full px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer rounded-xl",
                            isActive
                              ? "bg-surface/90 text-orange border border-orange/40 font-semibold shadow-sm"
                              : "text-steel-mid hover:bg-surface/60 hover:text-white border border-transparent",
                          )}
                        >
                          <span
                            className={cn(
                              "flex items-center justify-between gap-3 text-sm font-medium",
                              isActive
                                ? "text-orange"
                                : "text-steel-light",
                            )}
                          >
                            <span className="truncate">{category.label}</span>
                            {count > 0 ? (
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-mono font-medium",
                                isActive ? "bg-orange/20 text-orange" : "bg-steel-dark/15 text-steel-mid"
                              )}>
                                {count}
                              </span>
                            ) : null}
                          </span>
                          {category.description ? (
                            <span className="mt-1 block text-xs leading-snug text-steel-dark font-normal line-clamp-1">
                              {category.description}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  },
                )}
              </ul>
            </nav>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0 w-full">
        <Reveal className="lg:hidden">
          <Tabs value={catalog} onValueChange={handleCatalogChange}>
            <div className={catalogTabsScrollerClass}>
              <TabsList
                variant="line"
                aria-label="Catálogos"
                className="mb-6 h-auto w-max min-w-full flex-nowrap items-end justify-start gap-6 rounded-none border-b border-steel-dark/15 bg-transparent p-0"
              >
                {catalogConfig.catalogs.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className={catalogTabTriggerClass}
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </Reveal>

        {showSubFilters ? (
          <Reveal delay={0.05} className="lg:hidden">
            <div className="mb-8">
              <p className={`mb-3 ${sectionEyebrowClass}`}>Tipo</p>
              <div
                className={chipScrollerClass}
                role="group"
                aria-label="Tipos de equipo"
              >
                {[{ id: "all", label: "Todos" }, ...subCategories].map(
                  (category) => {
                    const isActive = subFilter === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() =>
                          handleSubFilterChange(category.id as SubFilterId)
                        }
                        className={cn(
                          "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-200",
                          isActive
                            ? "border-orange bg-orange text-white shadow-md shadow-orange/25"
                            : "border-steel-dark/30 bg-panel/60 text-steel-mid hover:border-orange/60 hover:text-steel-light",
                        )}
                      >
                        {category.label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.08}>
          <p className="mb-6 text-base text-steel-dark">
            {filtered.length} {filtered.length === 1 ? "equipo" : "equipos"}
            {totalPages > 1 ? (
              <>
                {" "}
                · Página {page} de {totalPages}
              </>
            ) : null}
          </p>
        </Reveal>

        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {paginatedProducts.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <ProductCard product={product} catalogConfig={catalogConfig} />
            </StaggerItem>
          ))}
        </Stagger>

        {totalPages > 1 ? (
          <nav
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
            aria-label="Paginación del catálogo"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="text-steel-mid hover:text-orange"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              Anterior
            </Button>
            <span className="text-base text-steel-mid">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="text-steel-mid hover:text-orange"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
