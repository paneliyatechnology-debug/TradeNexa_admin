import type { Metadata } from "next";
import { AdminPlatformDashboard } from "@/components/dashboard/admin-platform-dashboard";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Support Dashboard",
};

export default function SupportDashboardPage() {
  return (
    <AdminPlatformDashboard
      title="Support Dashboard"
      description="Platform snapshot for support operations and moderation awareness."
      basePath={ROUTES.support.base}
      showProductApprovalLink={false}
    />
  );
}
