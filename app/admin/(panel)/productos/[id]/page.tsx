import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products-server";

export const dynamic = "force-dynamic";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  return {
    title: product
      ? `Editar ${product.name} | Fica Tostadores`
      : "Editar producto | Fica Tostadores",
  };
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Editar
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
        {product.name}
      </h2>
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-6 md:p-8">
        <ProductForm mode="edit" initialProduct={product} />
      </div>
    </div>
  );
}
