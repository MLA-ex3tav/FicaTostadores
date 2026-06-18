"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAdmin, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/admin/login?error=no-autorizado");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-steel-mid">
        Verificando acceso…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
