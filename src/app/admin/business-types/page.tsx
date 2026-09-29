import type { Metadata } from "next";
import { BusinessTypeManagement } from "@/components/business-types/business-type-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Business Types Management",
};

export default function AdminBusinessTypesPage() {
  return (
    <BusinessTypeManagement
      title="Business Types Management"
      basePath={ROUTES.admin.base}
    />
  );
}
