"use client";

import { AdminPlatformDashboard } from "@/components/dashboard/admin-platform-dashboard";

export function SuperAdminDashboard() {
  return (
    <AdminPlatformDashboard
      title="Super Admin Dashboard"
      description="Monitor platform health, moderation queue, and marketplace growth."
      basePath="/super-admin"
    />
  );
}
