import type { Metadata } from "next";
import { CategoryManagement } from "@/components/categories/category-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Category & Brand",
};

export default function SuperAdminCategoryPage() {
  return (
    <CategoryManagement
      title="Category & Brand"
      basePath={ROUTES.superAdmin.base}
    />
  );
}
