import type { CotizacionProductLine } from "@/lib/cotizaciones/types";
import type { Product, ProductAddOn } from "@/lib/products";
import { hasValidListPrice } from "@/lib/pricing";
import type { QuoteProductAddOn, QuoteProductItem } from "@/lib/quote-selection";

export function mapAddOnsForQuote(
  addOns: ProductAddOn[],
  selectedIds: string[],
): QuoteProductAddOn[] {
  return addOns
    .filter((addOn) => selectedIds.includes(addOn.id))
    .map((addOn) => ({
      id: addOn.id,
      name: addOn.name,
      price: hasValidListPrice(addOn.price) ? addOn.price : null,
    }));
}

export function computeLineTotal(
  listPrice: number | null | undefined,
  addOns: QuoteProductAddOn[] | undefined,
): number | null {
  const base = hasValidListPrice(listPrice) ? listPrice : null;
  const addOnSum = (addOns ?? []).reduce((sum, addOn) => {
    if (!hasValidListPrice(addOn.price)) {
      return sum;
    }

    return sum + addOn.price;
  }, 0);

  if (base === null && addOnSum === 0) {
    return null;
  }

  return (base ?? 0) + addOnSum;
}

export function withQuoteLineTotal(item: QuoteProductItem): QuoteProductItem {
  return {
    ...item,
    lineTotal: computeLineTotal(item.listPrice, item.selectedAddOns),
  };
}

export function buildQuoteProductItem(
  product: Pick<Product, "id" | "name" | "capacity" | "listPrice" | "addOns">,
  selectedAddOnIds: string[],
): QuoteProductItem {
  const selectedAddOns = mapAddOnsForQuote(product.addOns, selectedAddOnIds);

  return withQuoteLineTotal({
    id: product.id,
    name: product.name,
    capacity: product.capacity,
    listPrice: hasValidListPrice(product.listPrice) ? product.listPrice : null,
    selectedAddOns,
  });
}

export function computeFinalTotal(
  lines: ReadonlyArray<{ lineTotal?: number | null }>,
): number | null {
  let total = 0;
  let hasAny = false;

  for (const line of lines) {
    if (hasValidListPrice(line.lineTotal)) {
      total += line.lineTotal;
      hasAny = true;
    }
  }

  return hasAny ? total : null;
}

export function isQuotePricingComplete(
  lines: ReadonlyArray<{ lineTotal?: number | null }>,
): boolean {
  if (lines.length === 0) {
    return false;
  }

  return lines.every((line) => hasValidListPrice(line.lineTotal));
}

export function enrichCotizacionProductLine(
  line: CotizacionProductLine,
  catalogProduct: Product | undefined,
): CotizacionProductLine {
  const selectedAddOns = line.selectedAddOns.map((clientAddOn) => {
    const catalogAddOn = catalogProduct?.addOns.find(
      (addOn) => addOn.id === clientAddOn.id,
    );

    return {
      id: clientAddOn.id,
      name: catalogAddOn?.name ?? clientAddOn.name,
      price: hasValidListPrice(catalogAddOn?.price) ? catalogAddOn.price : null,
    };
  });

  const listPrice = hasValidListPrice(catalogProduct?.listPrice)
    ? catalogProduct.listPrice
    : null;

  return {
    ...line,
    listPrice,
    selectedAddOns,
    lineTotal: computeLineTotal(listPrice, selectedAddOns),
  };
}

export function enrichCotizacionProducts(
  lines: CotizacionProductLine[],
  catalog: Product[],
): {
  products: CotizacionProductLine[];
  finalTotal: number | null;
  pricingComplete: boolean;
} {
  const products = lines.map((line) => {
    const catalogProduct = line.productId
      ? catalog.find((product) => product.id === line.productId)
      : undefined;

    return enrichCotizacionProductLine(line, catalogProduct);
  });

  return {
    products,
    finalTotal: computeFinalTotal(products),
    pricingComplete: isQuotePricingComplete(products),
  };
}
