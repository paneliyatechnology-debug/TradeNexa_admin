import type { Metadata } from "next";
import { ProductApprovalManagement } from "@/components/product-approval/product-approval-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Product Approval",
};

export default function SuperAdminProductApprovalPage() {
  return (
    <ProductApprovalManagement
      title="Product Approval"
      basePath={ROUTES.superAdmin.base}
    />
  );
}
