"use client";

import { RouteGuard } from "@/components/common/route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="SUPER_ADMIN">
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
