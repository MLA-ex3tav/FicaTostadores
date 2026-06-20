"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Product } from "@/lib/products";

const ProductDetailAdminEditWithAuth = dynamic(
  () => import("@/components/ProductDetailAdminEditWithAuth"),
  { ssr: false },
);

interface ProductDetailPageShellProps {
  product: Product;
  children: ReactNode;
}

export default function ProductDetailPageShell({
  product,
  children,
}: ProductDetailPageShellProps) {
  return (
    <ProductDetailAdminEditWithAuth product={product}>
      {children}
    </ProductDetailAdminEditWithAuth>
  );
}
