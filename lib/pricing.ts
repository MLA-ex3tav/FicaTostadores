const CLP_FORMATTER = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatClpPrice(amount: number): string {
  return CLP_FORMATTER.format(Math.round(amount));
}

export function hasValidListPrice(
  price: number | null | undefined,
): price is number {
  return typeof price === "number" && Number.isFinite(price) && price >= 0;
}

export function parseClpPriceInput(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
      return null;
    }

    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\./g, "").replace(/\s/g, "").trim();

  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseInt(cleaned, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
