import FirebaseAuthShell from "@/components/FirebaseAuthShell";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <FirebaseAuthShell>
      <div className="min-h-screen bg-background">{children}</div>
    </FirebaseAuthShell>
  );
}
