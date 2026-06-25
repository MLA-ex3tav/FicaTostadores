"use client";

import ProductDetailAdminEdit from "@/components/ProductDetailAdminEdit";
import type { Product } from "@/lib/products";
import type { ReactNode } from "react";

interface ProductDetailAdminEditWithAuthProps {
  product: Product;
  children: ReactNode;
}

export default function ProductDetailAdminEditWithAuth({
  product,
  children,
}: ProductDetailAdminEditWithAuthProps) {
  return (
    <ProductDetailAdminEdit product={product}>{children}</ProductDetailAdminEdit>
  );
}
