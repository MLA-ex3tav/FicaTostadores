export type UserRole = "cliente" | "editor" | "admin";

export const USER_ROLES: UserRole[] = ["cliente", "editor", "admin"];

export function parseUserRole(value: string | undefined | null): UserRole | null {
  if (!value) {
    return null;
  }

  switch (value) {
    case "cliente":
    case "editor":
    case "admin":
      return value;
    default:
      return null;
  }
}

export function isStaffRole(role: string | undefined | null): boolean {
  return role === "editor" || role === "admin";
}

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}

/** @deprecated Use isSuperAdminRole or isStaffRole */
export function isAdminRole(role: string | undefined | null): boolean {
  return isSuperAdminRole(role);
}

export function canAccessAdminPanel(role: string | undefined | null): boolean {
  return isStaffRole(role);
}

export function canManageCatalog(role: string | undefined | null): boolean {
  return isStaffRole(role);
}

export function canManageUsers(role: string | undefined | null): boolean {
  return isSuperAdminRole(role);
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "cliente":
      return "Cliente";
    case "editor":
      return "Editor";
    case "admin":
      return "Administrador";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}
