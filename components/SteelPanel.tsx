import { type ReactNode } from "react";

interface SteelPanelProps {
  children: ReactNode;
  className?: string;
}

export default function SteelPanel({ children, className = "" }: SteelPanelProps) {
  return (
    <div className={`steel-texture steel-border min-w-0 w-full p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
