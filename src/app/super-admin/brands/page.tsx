import type { Metadata } from "next";
import { BrandManagement } from "@/components/brands/brand-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Brands",
};

export default function SuperAdminBrandsPage() {
  return (
    <BrandManagement title="Brands" basePath={ROUTES.superAdmin.base} />
  );
}
