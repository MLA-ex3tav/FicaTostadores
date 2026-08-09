"use client";

import GoogleLoginCard from "@/components/GoogleLoginCard";

export default function AdminLoginPanel() {
  return (
    <GoogleLoginCard
      badge="Acceso restringido"
      title="Iniciar sesión"
      subtitle="Ingrese con su correo y contraseña o continúe con Google. Solo personal autorizado."
      adminRedirect
    />
  );
}
