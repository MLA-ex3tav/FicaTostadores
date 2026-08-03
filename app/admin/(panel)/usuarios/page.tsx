import SuperAdminGuard from "@/components/admin/SuperAdminGuard";
import UsersAdminPanel from "@/components/admin/UsersAdminPanel";

export const metadata = {
  title: "Usuarios admin | Fica Tostadores",
};

export default function AdminUsuariosPage() {
  return (
    <SuperAdminGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Equipo
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
          USUARIOS Y <span className="text-orange">ROLES</span>
        </h1>
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
