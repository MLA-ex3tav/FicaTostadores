import CatalogAdminPanel from "@/components/admin/CatalogAdminPanel";

export const metadata = {
  title: "Catálogos admin | Fica Tostadores",
};

export default function AdminCatalogsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Catálogos
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
        Líneas de productos
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-steel-mid">
        Los catálogos agrupan equipos por línea (café, frutos secos, etc.).
        Créelos aquí y luego asígnelos al crear o editar un producto.
      </p>
      <div className="mt-8">
        <CatalogAdminPanel />
      </div>
    </div>
  );
}
