import FirebaseAuthShell from "@/components/FirebaseAuthShell";
import type { ReactNode } from "react";

interface IniciarSesionLayoutProps {
  children: ReactNode;
}

export default function IniciarSesionLayout({ children }: IniciarSesionLayoutProps) {
  return <FirebaseAuthShell>{children}</FirebaseAuthShell>;
}
