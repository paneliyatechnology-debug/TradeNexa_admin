import type { Metadata } from "next";
import { CategoryManagement } from "@/components/categories/category-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Categories",
};

export default function SuperAdminCategoryPage() {
  return (
    <CategoryManagement
      title="Categories"
      basePath={ROUTES.superAdmin.base}
    />
  );
}
