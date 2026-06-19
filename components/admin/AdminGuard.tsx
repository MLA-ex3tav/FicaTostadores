"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isStaff, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isStaff) {
      router.replace("/admin/login?error=no-autorizado");
    }
  }, [user, isStaff, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-steel-mid">
        Verificando acceso…
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  return <>{children}</>;
}
