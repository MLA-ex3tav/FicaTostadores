export const CLIENTES_COLLECTION = "clientes";

export { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";

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
