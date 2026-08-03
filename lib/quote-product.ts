import type { CotizacionProductLine } from "@/lib/cotizaciones/types";
import type { Product, ProductAddOn } from "@/lib/products";
import {
  DEFAULT_PRODUCT_COLOR_ID,
  getProductColorLabel,
} from "@/lib/product-colors";
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
    }));
}

export function buildQuoteProductItem(
  product: Pick<Product, "id" | "name" | "capacity" | "addOns">,
  selectedAddOnIds: string[],
  color?: {
    id?: string | null;
    name?: string | null;
  } | null,
): QuoteProductItem {
  const selectedAddOns = mapAddOnsForQuote(product.addOns, selectedAddOnIds);
  const selectedColorId = color?.id?.trim() || DEFAULT_PRODUCT_COLOR_ID;
  const selectedColor =
    color?.name?.trim() ||
    getProductColorLabel(selectedColorId) ||
    getProductColorLabel(DEFAULT_PRODUCT_COLOR_ID);

  return {
    id: product.id,
    name: product.name,
    capacity: product.capacity,
    selectedColor,
    selectedColorId,
    selectedAddOns,
  };
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
    };
  });

  return {
    ...line,
    selectedAddOns,
  };
}

export function enrichCotizacionProducts(
  lines: CotizacionProductLine[],
  catalog: Product[],
): CotizacionProductLine[] {
  return lines.map((line) => {
    const catalogProduct = line.productId
      ? catalog.find((product) => product.id === line.productId)
      : undefined;

    return enrichCotizacionProductLine(line, catalogProduct);
  });
}
