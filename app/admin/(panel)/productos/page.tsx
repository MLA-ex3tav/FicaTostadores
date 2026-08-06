import Link from "next/link";
import { Plus } from "lucide-react";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import ProductExcelImport from "@/components/admin/ProductExcelImport";
import { getCatalogConfig } from "@/lib/catalog-config-server";
import { canPersistProducts } from "@/lib/products-repository";
import { getProducts } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos admin | Fica Tostadores",
};

export default async function AdminProductsPage() {
  const [products, catalogConfig] = await Promise.all([
    getProducts(),
    getCatalogConfig(),
  ]);
  const canPersist = canPersistProducts();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Catálogo Industrial
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-steel-light">
            Gestión de Productos ({products.length})
          </h1>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover shadow-lg shadow-orange/20"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Link>
      </div>

      {!canPersist && (
        <p className="mt-6 rounded-lg border border-orange/30 bg-orange/10 px-4 py-3 text-sm text-orange">
          Firebase Admin no está configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON
          o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local (y en Vercel en
          producción). Sin eso solo puede ver el catálogo.
        </p>
      )}

      <div className="mt-8">
        <AdminProductsTable
          products={products}
          catalogConfig={catalogConfig}
        />
      </div>

      <ProductExcelImport catalogConfig={catalogConfig} />
    </div>
  );
}
