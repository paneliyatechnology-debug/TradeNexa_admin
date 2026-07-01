import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/common/placeholder-page";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminDashboardPage() {
  return <PlaceholderPage title="Dashboard" basePath={ROUTES.superAdmin.base} />;
}
