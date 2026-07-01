import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/common/placeholder-page";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Support Dashboard",
};

export default function SupportDashboardPage() {
  return <PlaceholderPage title="Dashboard" basePath={ROUTES.support.base} />;
}
