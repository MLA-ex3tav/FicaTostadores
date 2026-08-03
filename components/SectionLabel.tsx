import type { ReactNode } from "react";
import { sectionTitleClass } from "@/components/SectionHeader";

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return <h2 className={sectionTitleClass}>{children}</h2>;
}
