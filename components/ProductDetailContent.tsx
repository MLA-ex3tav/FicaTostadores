"use client";

import type { Product } from "@/lib/products";

interface ProductDetailContentProps {
  product: Product;
}

export default function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  const hasDescription = Boolean(product.longDescription?.trim());
  const hasFeatures = product.features.length > 0;
  const hasDetails = product.technicalDetails.length > 0;

  if (!hasDescription && !hasFeatures && !hasDetails) {
    return null;
  }

  return (
    <div className="space-y-12 md:space-y-14">
      {hasDescription ? (
        <section>
          <h2 className="border-b border-white/[0.08] pb-3 font-display text-xl tracking-wide text-steel-light md:text-2xl">
            Descripción
          </h2>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-steel-mid">
            {product.longDescription}
          </p>
        </section>
      ) : null}

      {hasFeatures ? (
        <section>
          <h2 className="border-b border-white/[0.08] pb-3 font-display text-xl tracking-wide text-steel-light md:text-2xl">
            Características
          </h2>
          <ul className="mt-2">
            {product.features.map((feature, index) => (
              <li
                key={`${product.id}-feat-${index}`}
                className="flex gap-3 border-b border-white/[0.06] py-3.5 text-sm leading-relaxed text-steel-mid last:border-b-0 md:text-[0.95rem]"
              >
                <span className="mt-2 h-px w-3 shrink-0 bg-steel-dark" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasDetails ? (
        <section>
          <h2 className="border-b border-white/[0.08] pb-3 font-display text-xl tracking-wide text-steel-light md:text-2xl">
            Ficha técnica
          </h2>
          <dl className="mt-2">
            {product.technicalDetails.map((detail, index) => (
              <div
                key={`${product.id}-detail-${index}`}
                className="grid gap-1 border-b border-white/[0.06] py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6"
              >
                <dt className="text-xs uppercase tracking-wider text-steel-dark">
                  {detail.label}
                </dt>
                <dd className="text-sm font-medium text-steel-light sm:text-right md:text-base">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
