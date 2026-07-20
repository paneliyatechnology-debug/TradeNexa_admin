"use client";

import { AdminPlatformDashboard } from "@/components/dashboard/admin-platform-dashboard";

export function SupportAdminDashboard() {
  return (
    <AdminPlatformDashboard
      title="Support Dashboard"
      description="Platform snapshot for support operations and moderation awareness."
      basePath="/support"
      showProductApprovalLink={false}
    />
  );
}
