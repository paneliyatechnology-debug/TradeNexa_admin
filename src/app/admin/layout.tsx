"use client";

import { RouteGuard } from "@/components/common/route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="ADMIN">
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
