import type { Metadata } from "next";
import { CategoryManagement } from "@/components/categories/category-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Category Management",
};

export default function AdminCategoryManagementPage() {
  return (
    <CategoryManagement
      title="Category Management"
      basePath={ROUTES.admin.base}
    />
  );
}
