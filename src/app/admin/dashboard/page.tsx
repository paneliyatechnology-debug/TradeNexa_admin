import type { Metadata } from "next";
import { AdminPlatformDashboard } from "@/components/dashboard/admin-platform-dashboard";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <AdminPlatformDashboard
      title="Admin Dashboard"
      basePath={ROUTES.admin.base}
    />
  );
}
