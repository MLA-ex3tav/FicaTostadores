import SuperAdminGuard from "@/components/admin/SuperAdminGuard";
import UsersAdminPanel from "@/components/admin/UsersAdminPanel";

export const metadata = {
  title: "Usuarios admin | Fica Tostadores",
};

export default function AdminUsuariosPage() {
  return (
    <SuperAdminGuard>
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
              Equipo y Permisos
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-steel-light">
              Gestión de Usuarios
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-steel-mid">
          Gestione quién puede acceder al panel como editor o administrador.
        </p>

        <div className="mt-8">
          <UsersAdminPanel />
        </div>
      </div>
    </SuperAdminGuard>
  );
}
