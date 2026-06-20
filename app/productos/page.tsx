import { Suspense } from "react";
import ProductsCatalog from "@/components/ProductsCatalog";
import SectionHeader from "@/components/SectionHeader";
import { getCatalogConfig } from "@/lib/catalog-config-server";
import { getProducts } from "@/lib/products-server";

export const revalidate = 300;

export const metadata = {
  title: "Productos | Fica Tostadores",
  description:
    "Catálogo de tostadores de café TLC, tostadores comerciales e industriales, molinos, partidores y descascaradores. Fabricación chilena.",
};

function ProductsCatalogFallback() {
  return (
    <p className="text-base text-steel-mid" role="status">
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
        <SectionHeader
          as="h1"
          eyebrow="Catálogo"
          title={
            <>
              NUESTROS <span className="text-orange">PRODUCTOS</span>
            </>
          }
        />
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
