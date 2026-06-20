"use client";

import { type ReactNode } from "react";
import ProductDetailAdminEdit from "@/components/ProductDetailAdminEdit";
import FirebaseAuthShell from "@/components/FirebaseAuthShell";
import type { Product } from "@/lib/products";

interface ProductDetailAdminEditWithAuthProps {
  product: Product;
  children: ReactNode;
}

export default function ProductDetailAdminEditWithAuth({
  product,
  children,
}: ProductDetailAdminEditWithAuthProps) {
  return (
    <FirebaseAuthShell>
      <ProductDetailAdminEdit product={product}>{children}</ProductDetailAdminEdit>
    </FirebaseAuthShell>
  );
}
