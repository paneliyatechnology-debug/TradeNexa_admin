"use client";

import { PageLoader } from "@/components/ui/loader";
import { isRoleAllowedForPath } from "@/constants/roles";
import { ROLE_DASHBOARD_MAP, ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export function RouteGuard({ children, allowedRole }: RouteGuardProps) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasAccess =
    !!role &&
    isAuthenticated &&
    isRoleAllowedForPath(role, allowedRole, pathname);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !role) {
      router.replace(ROUTES.login);
      return;
    }

    if (!isRoleAllowedForPath(role, allowedRole, pathname)) {
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
