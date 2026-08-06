import ProductForm from "@/components/admin/ProductForm";

export const metadata = {
  title: "Nuevo producto | Fica Tostadores",
};

export default function AdminNewProductPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Nuevo
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
        Agregar producto
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-steel-mid">
        Completa la ficha del equipo. Usa «Guardar y crear otro» para cargar
        varios productos seguidos.
      </p>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
