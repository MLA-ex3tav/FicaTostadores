"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const router = useRouter();
  const { user, isSuperAdmin, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isSuperAdmin) {
      router.replace("/admin/productos");
    }
  }, [user, isSuperAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-steel-mid">
        Verificando acceso…
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
