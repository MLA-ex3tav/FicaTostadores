export const CLIENTES_COLLECTION = "clientes";

export type UserRole = "cliente" | "admin";

export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}
