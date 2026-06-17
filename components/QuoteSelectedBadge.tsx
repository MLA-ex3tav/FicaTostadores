export const quoteSelectedPanelClass = "border-orange/50";

interface QuoteSelectedLabelProps {
  className?: string;
}

export default function QuoteSelectedLabel({
  className = "",
}: QuoteSelectedLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-orange ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
      En cotización
    </span>
  );
}
