import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div>
      <h2 className="font-display text-lg tracking-wide text-steel-light md:text-xl">
        {children}
      </h2>
    </div>
  );
}
