"use client";

import { PageLoader } from "@/components/ui/loader";
import { canAccessRoleRoute, isRoleAllowedForPath } from "@/constants/roles";
import { ROLE_DASHBOARD_MAP, ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_SWITCHER_ENABLED } from "@/lib/preview-role";
import type { UserRole } from "@/types/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

function canAccessLayout(
  role: UserRole,
  allowedRole: UserRole,
  pathname: string
): boolean {
  if (ROLE_SWITCHER_ENABLED) {
    return canAccessRoleRoute(allowedRole, pathname);
  }

  return isRoleAllowedForPath(role, allowedRole, pathname);
}

export function RouteGuard({ children, allowedRole }: RouteGuardProps) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasAccess =
    !!role && isAuthenticated && canAccessLayout(role, allowedRole, pathname);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !role) {
      router.replace(ROUTES.login);
      return;
    }

    if (!canAccessLayout(role, allowedRole, pathname)) {
      router.replace(ROUTES.unauthorized);
    }
  }, [loading, isAuthenticated, role, allowedRole, pathname, router]);

  if (loading || !hasAccess) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && role) {
      router.replace(ROLE_DASHBOARD_MAP[role]);
    }
  }, [loading, isAuthenticated, role, router]);

  if (loading || isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

export function HomeRedirect() {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && role) {
      router.replace(ROLE_DASHBOARD_MAP[role]);
      return;
    }

    router.replace(ROUTES.login);
  }, [loading, isAuthenticated, role, router]);

  return <PageLoader />;
}
