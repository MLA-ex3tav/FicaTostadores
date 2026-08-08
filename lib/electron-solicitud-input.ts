/**
 * Parser común para los endpoints /api/electron/solicitudes*.
 *
 * Normaliza el input que envían las apps movil/escritorio:
 * - text: limpieza de strings acotada.
 * - products: líneas de producto { productId, name, quantity, unitPrice }.
 * - pricing: cálculo de subtotal / IVA / total (CLP).
 */

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export interface LineaProducto {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export function parseProductInputLines(
  value: unknown,
  maxLines = 20,
): LineaProducto[] {
  if (!Array.isArray(value)) return [];

  const lines: LineaProducto[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const name = cleanText(record.name, 200);
    const productId = cleanText(record.productId ?? record.id, 120);

    if (!name && !productId) continue;

    const quantity = Math.max(
      1,
      Math.round(toNumber(record.quantity ?? record.cantidad) ?? 1),
    );
    const unitPrice = Math.max(
      0,
      toNumber(record.unitPrice ?? record.price ?? record.precio) ?? 0,
    );

    lines.push({ productId, name, quantity, unitPrice });
  }

  return lines.slice(0, maxLines);
}

export function computePricing(products: LineaProducto[]): {
  subtotal: number;
  precioFinal: number;
  iva: number;
  total: number;
} {
  const subtotal = products.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  );
  return {
    subtotal,
    precioFinal: subtotal,
    iva: Math.round(subtotal * 0.19),
    total: Math.round(subtotal * 1.19),
  };
}