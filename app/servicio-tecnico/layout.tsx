import FirebaseAuthShell from "@/components/FirebaseAuthShell";
import type { ReactNode } from "react";

interface ServicioTecnicoLayoutProps {
  children: ReactNode;
}

export default function ServicioTecnicoLayout({
  children,
}: ServicioTecnicoLayoutProps) {
  return <FirebaseAuthShell>{children}</FirebaseAuthShell>;
}
