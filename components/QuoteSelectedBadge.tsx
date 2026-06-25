import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const quoteSelectedPanelClass = "border-orange/50";

interface QuoteSelectedLabelProps {
  className?: string;
}

export default function QuoteSelectedLabel({
  className = "",
}: QuoteSelectedLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orange/45 bg-orange/10 text-orange",
        className,
      )}
      title="En cotización"
    >
      <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
      <span className="sr-only">En cotización</span>
    </span>
  );
}
