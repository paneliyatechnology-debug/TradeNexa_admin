import type { SortOrder } from "@/types/api";

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  slug: string;
  is_popular: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandDetail extends Brand {
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
}

export interface CreateBrandInput {
  name: string;
  logo: File;
  is_popular: boolean;
}

export interface UpdateBrandInput {
  name: string;
  logo?: File | null;
  clear_logo?: boolean;
  is_popular: boolean;
}

export type BrandSortBy = "id" | "name" | "created_at";

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_popular?: boolean;
  sort_by?: BrandSortBy;
  sort_order?: SortOrder;
}
