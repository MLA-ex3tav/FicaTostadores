import { type ReactNode } from "react";

interface SteelPanelProps {
  children: ReactNode;
  className?: string;
  unpadded?: boolean;
}

export default function SteelPanel({
  children,
  className = "",
  unpadded = false,
}: SteelPanelProps) {
  return (
    <div
      className={`steel-texture steel-border min-w-0 w-full ${unpadded ? "" : "p-6 md:p-8"} ${className}`}
    >
      {children}
    </div>
  );
}
