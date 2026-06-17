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

const STORAGE_KEY = "fica-quote-selection";

export interface QuoteProductItem {
  id: string;
  name: string;
  capacity: string;
}

interface QuoteSelectionContextValue {
  products: QuoteProductItem[];
  addProduct: (product: QuoteProductItem) => void;
  removeProduct: (id: string) => void;
  hasProduct: (id: string) => boolean;
  clearProducts: () => void;
}

const QuoteSelectionContext = createContext<QuoteSelectionContextValue | null>(
  null,
);

function readStoredProducts(): QuoteProductItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as QuoteProductItem[];
    return Array.isArray(parsed) ? parsed : [];
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
      if (current.some((item) => item.id === product.id)) {
        return current;
      }

      return [...current, product];
    });
  }, []);

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
      removeProduct,
      hasProduct,
      clearProducts,
    }),
    [products, addProduct, removeProduct, hasProduct, clearProducts],
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
