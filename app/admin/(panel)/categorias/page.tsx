import CategoryAdminPanel from "@/components/admin/CategoryAdminPanel";

export const metadata = {
  title: "Categorías admin | Fica Tostadores",
};

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Categorías
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
        Tipos de equipo
      </h2>
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
