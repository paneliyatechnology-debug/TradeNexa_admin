import type { SortOrder } from "@/types/api";

export interface Offer {
  id: number;
  title: string;
  banner: string | null;
  discount: number;
  expiry_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfferDetail extends Offer {
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
}

export interface CreateOfferInput {
  title: string;
  banner?: File | null;
  discount: number;
  expiry_date: string;
}

export interface UpdateOfferInput {
  title: string;
  banner?: File | null;
  clear_banner?: boolean;
  discount: number;
  expiry_date: string;
}

export interface OfferListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "id" | "created_at" | "title";
  sort_order?: SortOrder;
}

export function formatExpiryDateForApi(dateValue: string): string {
  if (!dateValue) return "";

  if (dateValue.includes("T")) {
    return new Date(dateValue).toISOString();
  }

  return `${dateValue}T23:59:59.000Z`;
}

export function formatExpiryDateForInput(iso?: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function formatExpiryDateLabel(iso?: string | null): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
