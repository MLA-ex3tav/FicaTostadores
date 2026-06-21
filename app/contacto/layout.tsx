import FirebaseAuthShell from "@/components/FirebaseAuthShell";
import type { ReactNode } from "react";

interface ContactoLayoutProps {
  children: ReactNode;
}

export default function ContactoLayout({ children }: ContactoLayoutProps) {
  return <FirebaseAuthShell>{children}</FirebaseAuthShell>;
}
