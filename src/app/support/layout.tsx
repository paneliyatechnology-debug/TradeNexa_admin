"use client";

import { RouteGuard } from "@/components/common/route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="SUPPORT_ADMIN">
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
