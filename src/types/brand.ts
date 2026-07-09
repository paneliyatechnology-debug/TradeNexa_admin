import type { SortOrder } from "@/types/api";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  website: string | null;
  country: string | null;
  logo: string | null;
  is_popular: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandDetail extends Brand {
  created_by?: number | null;
  updated_by?: number | null;
  deleted_at?: string | null;
}

export interface CreateBrandInput {
  name: string;
  logo: File;
  description?: string;
  country?: string;
  website?: string;
  is_popular: boolean;
  is_active: boolean;
  is_featured: boolean;
}

export interface UpdateBrandInput {
  name: string;
  logo?: File | null;
  clear_logo?: boolean;
  description?: string;
  country?: string;
  website?: string;
  is_popular: boolean;
  is_active: boolean;
  is_featured: boolean;
}

export type BrandSortBy = "id" | "name" | "country" | "website" | "created_at";

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_popular?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  sort_by?: BrandSortBy;
  sort_order?: SortOrder;
}
