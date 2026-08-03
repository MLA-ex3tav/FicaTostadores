import { Suspense } from "react";
import AdminLoginPanel from "@/components/admin/AdminLoginPanel";

export const metadata = {
  title: "Iniciar sesión | Fica Tostadores",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16 md:px-6">
      <Suspense fallback={<p className="text-sm text-steel-mid">Cargando…</p>}>
        <AdminLoginPanel />
      </Suspense>
    </div>
  );
}