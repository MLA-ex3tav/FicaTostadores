import { Suspense } from "react";
import ProductsCatalog from "@/components/ProductsCatalog";
import { getCatalogConfig } from "@/lib/catalog-config-server";
import { getProducts } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos | Fica Tostadores",
  description:
    "Catálogo de tostadores de café TLC, tostadores comerciales e industriales, molinos, partidores y descascaradores. Fabricación chilena.",
};

function ProductsCatalogFallback() {
  return (
    <p className="text-sm text-steel-mid" role="status">
      Cargando catálogo…
    </p>
  );
}

export default async function ProductosPage() {
  const [products, catalogConfig] = await Promise.all([
    getProducts(),
    getCatalogConfig(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Catálogo
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
          NUESTROS <span className="text-orange">PRODUCTOS</span>
        </h1>
        <p className="mt-4 max-w-2xl text-steel-mid">
          Dos líneas de equipos según nuestros catálogos: tostadores de café TLC
          y maquinaria para frutos secos, trigo y procesamiento. Elija un
          catálogo para ver los equipos correspondientes.
        </p>
        <div className="rivet-divider mt-8 max-w-md">
          <span />
        </div>
      </div>

      <Suspense fallback={<ProductsCatalogFallback />}>
        <ProductsCatalog products={products} catalogConfig={catalogConfig} />
      </Suspense>
    </div>
  );
}
