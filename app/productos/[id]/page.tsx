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
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <Link
          href="/productos"
          className="mb-8 inline-flex items-center gap-2 text-sm text-steel-mid transition-colors hover:text-orange"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Volver al catálogo
        </Link>
      </Reveal>

      <ProductDetailPageShell product={product}>
        <Reveal>
          <ProductDetailSections
            product={product}
            catalogConfig={catalogConfig}
          />
        </Reveal>
      </ProductDetailPageShell>
    </div>
  );
}
