import AdminProductsTable from "@/components/admin/AdminProductsTable";
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
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Productos
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
            {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </h2>
        </div>
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
    </div>
  );
}
