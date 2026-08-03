import { type ReactNode } from "react";

interface IconBadgeProps {
  children: ReactNode;
  className?: string;
}

export default function IconBadge({ children, className = "" }: IconBadgeProps) {
  return (
    <div
      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-orange/30 bg-orange/10 text-orange ${className}`}
    >
      {children}
    </div>
  );
}
