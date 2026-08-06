import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProductDetailPageShell from "@/components/ProductDetailPageShell";
import ProductDetailSections from "@/components/ProductDetailSections";
import Reveal from "@/components/motion/Reveal";
import { getCatalogConfig } from "@/lib/catalog-config-server";
import { getProductById, getProducts } from "@/lib/products-server";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Producto no encontrado | Fica Tostadores" };
  }

  return {
    title: `${product.name} | Fica Tostadores`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, catalogConfig] = await Promise.all([
    getProductById(id),
    getCatalogConfig(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 md:px-8 md:pb-24 md:pt-12 lg:px-10">
      <Reveal>
        <Link
          href="/productos"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-panel/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-steel-mid transition-colors hover:border-orange/35 hover:text-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Catálogo
        </Link>
      </Reveal>

      <ProductDetailPageShell product={product}>
        <ProductDetailSections
          product={product}
          catalogConfig={catalogConfig}
        />
      </ProductDetailPageShell>
    </div>
  );
}
