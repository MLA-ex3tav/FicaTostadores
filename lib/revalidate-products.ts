import { revalidatePath } from "next/cache";

export function revalidateProductPages(productId?: string): void {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin/productos");

  if (productId) {
    revalidatePath(`/productos/${productId}`);
    revalidatePath(`/admin/productos/${productId}`);
  }

  revalidatePath("/productos/[id]", "page");
}
