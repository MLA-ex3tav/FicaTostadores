import CategoryAdminPanel from "@/components/admin/CategoryAdminPanel";

export const metadata = {
  title: "Categorías admin | Fica Tostadores",
};

export default function AdminCategoriesPage() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Tipos de Equipos
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-steel-light">
            Gestión de Categorías
          </h1>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-steel-mid">
        Cada categoría pertenece a un catálogo (comercial, industrial,
        procesamiento, etc.) y se usa para filtrar productos en el sitio.
      </p>

      <div className="mt-8">
        <CategoryAdminPanel />
      </div>
    </div>
  );
}