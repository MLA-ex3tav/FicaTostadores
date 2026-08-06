import CatalogAdminPanel from "@/components/admin/CatalogAdminPanel";

export const metadata = {
  title: "Catálogos admin | Fica Tostadores",
};

export default function AdminCatalogsPage() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Líneas de Productos
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-steel-light">
            Gestión de Catálogos
          </h1>
        </div>
      </div>

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
