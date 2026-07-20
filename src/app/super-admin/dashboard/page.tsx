import type { Metadata } from "next";
import { AdminPlatformDashboard } from "@/components/dashboard/admin-platform-dashboard";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminDashboardPage() {
  return (
    <AdminPlatformDashboard
      title="Super Admin Dashboard"
      description="Monitor platform health, moderation queue, and marketplace growth."
      basePath={ROUTES.superAdmin.base}
    />
  );
}
