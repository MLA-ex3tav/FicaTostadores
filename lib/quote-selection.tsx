"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { withQuoteLineTotal } from "@/lib/quote-pricing";
import { parseClpPriceInput } from "@/lib/pricing";

const STORAGE_KEY = "fica-quote-selection";

export interface QuoteProductAddOn {
  id: string;
  name: string;
  price?: number | null;
}

export interface QuoteProductItem {
  id: string;
  name: string;
  capacity: string;
  listPrice?: number | null;
  lineTotal?: number | null;
  selectedAddOns?: QuoteProductAddOn[];
}

interface QuoteSelectionContextValue {
  products: QuoteProductItem[];
  addProduct: (product: QuoteProductItem) => void;
  updateProductAddOns: (id: string, selectedAddOns: QuoteProductAddOn[]) => void;
  removeProduct: (id: string) => void;
  hasProduct: (id: string) => boolean;
  clearProducts: () => void;
}

const QuoteSelectionContext = createContext<QuoteSelectionContextValue | null>(
  null,
);

function normalizeAddOn(value: unknown): QuoteProductAddOn | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") {
    return null;
  }

  const id = record.id.trim();
  const name = record.name.trim();
  if (!id || !name) {
    return null;
  }

  const price = parseClpPriceInput(record.price);

  return {
    id,
    name,
    price: price ?? null,
  };
}

function normalizeStoredProduct(value: unknown): QuoteProductItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.capacity !== "string"
  ) {
    return null;
  }

  const id = record.id.trim();
  const name = record.name.trim();
  const capacity = record.capacity.trim();
  if (!id || !name || !capacity) {
    return null;
  }

  const listPrice = parseClpPriceInput(record.listPrice);
  const selectedAddOns = Array.isArray(record.selectedAddOns)
    ? record.selectedAddOns
        .map(normalizeAddOn)
        .filter((addOn): addOn is QuoteProductAddOn => addOn !== null)
    : [];

  return withQuoteLineTotal({
    id,
    name,
    capacity,
    listPrice: listPrice ?? null,
    selectedAddOns,
  });
}

function readStoredProducts(): QuoteProductItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeStoredProduct)
      .filter((product): product is QuoteProductItem => product !== null);
  } catch {
    return [];
  }
}

export function QuoteSelectionProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<QuoteProductItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProducts(readStoredProducts());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products, hydrated]);

  const addProduct = useCallback((product: QuoteProductItem) => {
    setProducts((current) => {
      const normalized = withQuoteLineTotal({
        ...product,
        selectedAddOns: product.selectedAddOns ?? [],
      });
      const existingIndex = current.findIndex((item) => item.id === product.id);

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = {
          ...next[existingIndex],
          name: normalized.name,
          capacity: normalized.capacity,
          listPrice: normalized.listPrice,
          selectedAddOns: normalized.selectedAddOns,
          lineTotal: normalized.lineTotal,
        };
        return next;
      }

      return [...current, normalized];
    });
  }, []);

  const updateProductAddOns = useCallback(
    (id: string, selectedAddOns: QuoteProductAddOn[]) => {
      setProducts((current) =>
        current.map((item) =>
          item.id === id
            ? withQuoteLineTotal({ ...item, selectedAddOns })
            : item,
        ),
      );
    },
    [],
  );

  const removeProduct = useCallback((id: string) => {
    setProducts((current) => current.filter((item) => item.id !== id));
  }, []);

  const hasProduct = useCallback(
    (id: string) => products.some((item) => item.id === id),
    [products],
  );

  const clearProducts = useCallback(() => {
    setProducts([]);
  }, []);

  const value = useMemo(
    () => ({
      products,
      addProduct,
      updateProductAddOns,
      removeProduct,
      hasProduct,
      clearProducts,
    }),
    [
      products,
      addProduct,
      updateProductAddOns,
      removeProduct,
      hasProduct,
      clearProducts,
    ],
  );

  return (
    <QuoteSelectionContext.Provider value={value}>
      {children}
    </QuoteSelectionContext.Provider>
  );
}

export function useQuoteSelection() {
  const context = useContext(QuoteSelectionContext);

  if (!context) {
    throw new Error("useQuoteSelection debe usarse dentro de QuoteSelectionProvider");
  }

  return context;
}
