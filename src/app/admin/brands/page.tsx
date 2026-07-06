import type { Metadata } from "next";
import { BrandManagement } from "@/components/brands/brand-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Brand Management",
};

export default function AdminBrandsPage() {
  return (
    <BrandManagement
      title="Brand Management"
      basePath={ROUTES.admin.base}
    />
  );
}
