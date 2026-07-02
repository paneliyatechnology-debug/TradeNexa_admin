import type { UserRole } from "@/types/auth";

export const ADMIN_ACCESS_DENIED_MESSAGE =
  "Your account does not have access to the admin panel.";

const BACKEND_ROLE_MAP: Record<string, UserRole> = {
  super_admin: "SUPER_ADMIN",
  superadmin: "SUPER_ADMIN",
  admin: "ADMIN",
  support_admin: "SUPPORT_ADMIN",
  support: "SUPPORT_ADMIN",
};

export function normalizeRoleCode(roleCode: string): string {
  return roleCode.toLowerCase().trim().replace(/\s+/g, "_");
}

export function tryMapBackendRole(roleCode: string): UserRole | null {
  const role = BACKEND_ROLE_MAP[normalizeRoleCode(roleCode)];
  return role ?? null;
}

export function mapBackendRole(roleCode: string): UserRole {
  const role = tryMapBackendRole(roleCode);

  if (!role) {
    throw new Error(ADMIN_ACCESS_DENIED_MESSAGE);
  }

  return role;
}

export function isAllowedAdminRole(roleCode: string): boolean {
  return tryMapBackendRole(roleCode) !== null;
}
