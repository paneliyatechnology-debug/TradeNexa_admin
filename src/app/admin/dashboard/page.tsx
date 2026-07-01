import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/common/placeholder-page";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return <PlaceholderPage title="Dashboard" basePath={ROUTES.admin.base} />;
}
