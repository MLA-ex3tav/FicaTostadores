export const CLIENTES_COLLECTION = "clientes";

export type { UserRole } from "@/lib/permissions";
export {
  canAccessAdminPanel,
  canManageCatalog,
  canManageUsers,
  isAdminRole,
  isStaffRole,
  isSuperAdminRole,
  parseUserRole,
  USER_ROLES,
} from "@/lib/permissions";
