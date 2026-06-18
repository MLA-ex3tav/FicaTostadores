import ProductForm from "@/components/admin/ProductForm";

export const metadata = {
  title: "Nuevo producto | Fica Tostadores",
};

export default function AdminNewProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Nuevo
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
        Agregar producto
      </h2>
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-6 md:p-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
