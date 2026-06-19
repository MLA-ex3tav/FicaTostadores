import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProductAddOnsQuotePicker from "@/components/ProductAddOnsQuotePicker";
import ProductDetailAdminEdit from "@/components/ProductDetailAdminEdit";
import ProductDetailContent from "@/components/ProductDetailContent";
import ProductDetailHero from "@/components/ProductDetailHero";
import ProductQuoteActions from "@/components/ProductQuoteActions";
import SectionLabel from "@/components/SectionLabel";
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
      <Link
        href="/productos"
        className="mb-8 inline-flex items-center gap-2 text-sm text-steel-mid transition-colors hover:text-orange"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <ProductDetailAdminEdit product={product}>
      <ProductDetailHero product={product} catalogConfig={catalogConfig} />

      <ProductDetailContent product={product} />

      {product.addOns.length > 0 && (
        <section className="mt-20">
          <SectionLabel>
            Agregados y <span className="text-orange">opciones</span>
          </SectionLabel>
          <ProductAddOnsQuotePicker
            productId={product.id}
            productName={product.name}
            productCapacity={product.capacity}
            addOns={product.addOns}
          />
        </section>
      )}

      <ProductQuoteActions
        productId={product.id}
        productName={product.name}
        productCapacity={product.capacity}
        addOns={product.addOns}
      />
      </ProductDetailAdminEdit>
    </div>
  );
}
