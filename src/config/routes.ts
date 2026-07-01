import type { UserRole } from "@/types/auth";

export const ROUTES = {
  login: "/login",
  unauthorized: "/unauthorized",
  superAdmin: {
    base: "/super-admin",
    dashboard: "/super-admin/dashboard",
  },
  admin: {
    base: "/admin",
    dashboard: "/admin/dashboard",
  },
  support: {
    base: "/support",
    dashboard: "/support/dashboard",
  },
} as const;

export const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  SUPER_ADMIN: ROUTES.superAdmin.dashboard,
  ADMIN: ROUTES.admin.dashboard,
  SUPPORT_ADMIN: ROUTES.support.dashboard,
};

export const ROLE_BASE_MAP: Record<UserRole, string> = {
  SUPER_ADMIN: ROUTES.superAdmin.base,
  ADMIN: ROUTES.admin.base,
  SUPPORT_ADMIN: ROUTES.support.base,
};

export const GUEST_ROUTES = [ROUTES.login] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.superAdmin.base,
  ROUTES.admin.base,
  ROUTES.support.base,
] as const;
