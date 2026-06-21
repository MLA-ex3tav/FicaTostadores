import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { formatClpPrice, hasValidListPrice } from "@/lib/pricing";
import { getCatalogLabel } from "@/lib/catalog-config";
import { getCategoryLabel } from "@/lib/product-categories";
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
            {products.length} productos
          </h2>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-orange px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
        >
          Nuevo producto
        </Link>
      </div>

        {!canPersist && (
          <p className="mt-6 rounded-lg border border-orange/30 bg-orange/10 px-4 py-3 text-sm text-orange">
            Firebase Admin no está configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON
            o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local (y en Vercel en
            producción). Sin eso solo puede ver el catálogo.
          </p>
        )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Catálogo</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Imágenes</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-white/[0.04] last:border-b-0"
              >
                <td className="px-4 py-4">
                  <p className="font-display text-base text-steel-light">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-steel-dark">{product.id}</p>
                </td>
                <td className="px-4 py-4 text-steel-mid">
                  {getCatalogLabel(product.catalog, catalogConfig)}
                </td>
                <td className="px-4 py-4 text-steel-mid">
                  {getCategoryLabel(product.category, catalogConfig)}
                </td>
                <td className="px-4 py-4 text-steel-mid">
                  {hasValidListPrice(product.listPrice)
                    ? formatClpPrice(product.listPrice)
                    : "—"}
                </td>
                <td className="px-4 py-4 text-steel-mid">
                  {(product.images?.length ?? 0) > 0
                    ? `${product.images!.length} foto${product.images!.length === 1 ? "" : "s"}`
                    : "—"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-xs text-orange hover:text-orange-hover"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/productos/${product.id}`}
                      className="text-xs text-steel-mid hover:text-orange"
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

