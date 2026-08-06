import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoBadgeProps {
  label?: string;
  className?: string;
  size?: "sm" | "lg";
}

export default function PromoBadge({
  label = "PROMO",
  className = "",
  size = "sm",
}: PromoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500 to-orange-600 font-display font-black uppercase tracking-wider text-white shadow-lg shadow-amber-950/40",
        size === "sm"
          ? "px-3 py-1 text-[11px]"
          : "px-4 py-1.5 text-sm",
        className,
      )}
    >
      <Sparkles
        className={cn(
          "animate-pulse text-amber-100",
          size === "sm" ? "h-3 w-3" : "h-4 w-4",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}