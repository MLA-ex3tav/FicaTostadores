import Link from "next/link";
import { ArrowLeft, Cog } from "lucide-react";
import { notFound } from "next/navigation";
import ProductDetailHero from "@/components/ProductDetailHero";
import ProductQuoteActions from "@/components/ProductQuoteActions";
import SteelPanel from "@/components/SteelPanel";
import { getProductById, products } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

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
  const product = getProductById(id);

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

      <ProductDetailHero product={product} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display text-xl tracking-wide text-steel-light">
            Descripción
          </h2>
          <p className="mt-4 leading-relaxed text-steel-mid">
            {product.longDescription}
          </p>

          <div className="rivet-divider my-8">
            <span />
          </div>

          <h2 className="font-display text-xl tracking-wide text-steel-light">
            Características
          </h2>
          <ul className="mt-4 space-y-2">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-steel-mid"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <section>
          <h2 className="font-display text-xl tracking-wide text-steel-light md:text-2xl">
            Ficha <span className="text-orange">técnica</span>
          </h2>
          <SteelPanel className="mt-6">
            <dl className="grid gap-4">
              {product.technicalDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-lg border border-steel-dark/30 bg-background/40 px-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-widest text-steel-dark">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-steel-light">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </SteelPanel>
        </section>
      </div>

      {product.addOns.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-wide text-steel-light md:text-3xl">
            Agregados y <span className="text-orange">opciones</span>
          </h2>
          <p className="mt-3 max-w-2xl text-steel-mid">
            Opciones configurables para ampliar la capacidad de su equipo e
            integrarlo a su línea de producción.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {product.addOns.map((addOn) => (
              <SteelPanel key={addOn.id} className="p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Cog className="h-5 w-5 text-orange" strokeWidth={1.75} />
                  <h3 className="font-display text-lg tracking-wide text-steel-light">
                    {addOn.name}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-steel-mid">
                  {addOn.description}
                </p>
              </SteelPanel>
            ))}
          </div>
        </section>
      )}

      <ProductQuoteActions
        productId={product.id}
        productName={product.name}
        productCapacity={product.capacity}
      />
    </div>
  );
}
