"use client";

import GoogleLoginCard from "@/components/GoogleLoginCard";

export default function AdminLoginPanel() {
  return (
    <GoogleLoginCard
      badge="Administración"
      title="Acceso admin"
      subtitle="Ingrese con Google. Solo cuentas con permisos de administrador pueden editar productos."
      adminRedirect
    />
  );
}
