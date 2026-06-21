"use client";

import GoogleLoginCard from "@/components/GoogleLoginCard";

export default function AdminLoginPanel() {
  return (
    <GoogleLoginCard
      badge="Administración"
      title="Acceso admin"
      subtitle="Ingrese con Google. Solo cuentas con rol editor o administrador en Firestore pueden entrar al panel."
      adminRedirect
    />
  );
}
