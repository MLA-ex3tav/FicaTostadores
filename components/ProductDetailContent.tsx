import type { Product } from "@/lib/products";
import SectionLabel from "./SectionLabel";
interface ProductDetailContentProps {
  product: Product;
}

export default function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  return (
    <section className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-x-20">
      <div className="space-y-12">
        <div>
          <SectionLabel>Descripción</SectionLabel>
          <p className="mt-5 max-w-prose text-sm leading-[1.8] text-steel-mid">
            {product.longDescription}
          </p>
        </div>

        <div>
          <SectionLabel>Características</SectionLabel>
          <ul className="mt-5">
            {product.features.map((feature, index) => (
              <li
                key={feature}
                className={`flex gap-4 py-3.5 text-sm leading-relaxed text-steel-mid ${
                  index < product.features.length - 1
                    ? "border-b border-white/[0.06]"
                    : ""
                }`}
              >
                <span
                  className="mt-[0.55rem] h-px w-4 shrink-0 bg-orange/80"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <SectionLabel>
          Ficha <span className="text-orange">técnica</span>
        </SectionLabel>
        <dl className="mt-5 overflow-hidden rounded-lg border border-white/[0.08]">
          {product.technicalDetails.map((detail, index) => (
            <div
              key={detail.label}
              className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-baseline sm:gap-6 sm:px-5 ${
                index < product.technicalDetails.length - 1
                  ? "border-b border-white/[0.06]"
                  : ""
              }`}
            >
              <dt className="text-[11px] uppercase tracking-[0.14em] text-steel-dark">
                {detail.label}
              </dt>
              <dd className="text-sm font-medium tracking-wide text-steel-light sm:text-right">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
