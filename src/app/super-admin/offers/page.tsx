import type { Metadata } from "next";
import { OfferManagement } from "@/components/offers/offer-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Offers",
};

export default function SuperAdminOffersPage() {
  return (
    <OfferManagement title="Offers" basePath={ROUTES.superAdmin.base} />
  );
}
