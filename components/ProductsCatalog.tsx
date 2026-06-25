"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { sectionEyebrowClass } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const categoryTabTriggerClass =
  "h-auto shrink-0 flex-none rounded-none bg-transparent px-1 pb-2 pt-1 text-sm tracking-wide shadow-none border-b-2 border-transparent -mb-px data-active:border-orange data-active:bg-transparent data-active:text-steel-light data-active:shadow-none after:!hidden";

const catalogTabsScrollerClass =
  "-mx-4 overflow-x-auto overflow-y-hidden overscroll-y-none px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden";

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
      <Reveal>
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
        <Reveal delay={0.05}>
          <div className="mb-8">
            <p className={`mb-2 ${sectionEyebrowClass}`}>Tipo</p>
            <Tabs value={subFilter} onValueChange={handleSubFilterChange}>
              <div className={catalogTabsScrollerClass}>
                <TabsList
                  variant="line"
                  aria-label="Tipos de equipo"
                  className="h-auto w-max min-w-full flex-nowrap items-end justify-start gap-5 rounded-none border-b border-steel-dark/15 bg-transparent p-0"
                >
                <TabsTrigger value="all" className={categoryTabTriggerClass}>
                  Todos
                </TabsTrigger>
                {subCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={categoryTabTriggerClass}
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
                </TabsList>
              </div>
            </Tabs>
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

      <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
