import type { UserRole } from "@/types/auth";
import { ROLE_BASE_MAP } from "@/config/routes";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support Admin",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  ADMIN: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SUPPORT_ADMIN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
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
