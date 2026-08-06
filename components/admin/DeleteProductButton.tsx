"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Trash2 } from "lucide";
import { MorphIcon } from "morphicons/react";
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
  const [hovered, setHovered] = useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      title={`Eliminar ${productName}`}
      aria-label={`Eliminar ${productName}`}
      className="grid h-8 w-8 place-items-center rounded-lg border border-steel-dark/25 bg-background/40 text-steel-mid transition-colors hover:border-orange/40 hover:text-orange disabled:opacity-50"
    >
      <MorphIcon
        icon={hovered ? Check : Trash2}
        size={16}
        strokeWidth={1.75}
        spring="snappy"
        className={loading ? "animate-pulse" : undefined}
      />
    </button>
  );
}
