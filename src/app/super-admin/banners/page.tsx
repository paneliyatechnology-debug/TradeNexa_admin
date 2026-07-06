import type { Metadata } from "next";
import { BannerManagement } from "@/components/banners/banner-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Banners",
};

export default function SuperAdminBannersPage() {
  return (
    <BannerManagement
      title="Banners"
      basePath={ROUTES.superAdmin.base}
    />
  );
}
