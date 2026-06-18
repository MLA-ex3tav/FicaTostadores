import AdminGuard from "@/components/admin/AdminGuard";
import AdminHeader from "@/components/admin/AdminHeader";
import type { ReactNode } from "react";

interface AdminPanelLayoutProps {
  children: ReactNode;
}

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  return (
    <AdminGuard>
      <AdminHeader />
      {children}
    </AdminGuard>
  );
}
