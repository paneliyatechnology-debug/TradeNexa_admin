import type { Metadata } from "next";
import { OfferManagement } from "@/components/offers/offer-management";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Offer Management",
};

export default function AdminOffersPage() {
  return (
    <OfferManagement title="Offer Management" basePath={ROUTES.admin.base} />
  );
}
