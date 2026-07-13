import type { UserRole } from "@/types/auth";
import { ROLE_BASE_MAP } from "@/config/routes";

export const ALL_USER_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT_ADMIN",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support Admin",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-primary/10 text-primary border-primary/20",
  ADMIN: "bg-info/10 text-info border-info/20",
  SUPPORT_ADMIN: "bg-success/10 text-success border-success/20",
};

export function canAccessRoleRoute(role: UserRole, pathname: string): boolean {
  const basePath = ROLE_BASE_MAP[role];
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function isRoleAllowedForPath(
  userRole: UserRole,
  allowedRole: UserRole,
  pathname: string
): boolean {
  return userRole === allowedRole && canAccessRoleRoute(userRole, pathname);
}
