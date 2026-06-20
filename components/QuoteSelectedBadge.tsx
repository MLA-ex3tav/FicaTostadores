export const quoteSelectedPanelClass = "border-orange/50";

interface QuoteSelectedLabelProps {
  className?: string;
}

export default function QuoteSelectedLabel({
  className = "",
}: QuoteSelectedLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-orange ${className}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-orange" aria-hidden />
      En cotización
    </span>
  );
}
