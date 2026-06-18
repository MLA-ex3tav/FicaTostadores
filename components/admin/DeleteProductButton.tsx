"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const { adminFetch } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${productName}" del catálogo? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await adminFetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "No se pudo eliminar el producto.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={loading}
      className="text-xs text-steel-dark transition-colors hover:text-orange disabled:opacity-50"
    >
      {loading ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
