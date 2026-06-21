import { formatClpPrice, hasValidListPrice } from "@/lib/pricing";

interface ProductPriceProps {
  amount: number | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
  suffix?: string;
}

const sizeClasses = {
  sm: "text-sm font-semibold",
  md: "text-lg font-semibold",
  lg: "text-2xl font-semibold md:text-3xl",
} as const;

export default function ProductPrice({
  amount,
  className = "",
  size = "md",
  suffix,
}: ProductPriceProps) {
  if (!hasValidListPrice(amount)) {
    return null;
  }

  return (
    <p className={`tracking-wide text-steel-light ${sizeClasses[size]} ${className}`}>
      <span className="text-orange">{formatClpPrice(amount)}</span>
      {suffix ? (
        <span className="ml-2 text-sm font-normal text-steel-dark">{suffix}</span>
      ) : null}
    </p>
  );
}
