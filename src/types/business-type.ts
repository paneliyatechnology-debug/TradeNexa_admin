import type { ListParams, SortOrder } from "@/types/api";

export interface BusinessType {
  id: number;
  role_id: number;
  role_name?: string;
  role_code?: string;
  name: string;
  code: string;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessTypeDetail extends BusinessType {
  role?: {
    id: number;
    name: string;
    code: string;
  };
}

export type BusinessTypeSortBy = "id" | "name" | "code" | "is_active" | "created_at";

export interface BusinessTypeListParams extends ListParams {
  role_id?: number;
  search?: string;
  sort_by?: BusinessTypeSortBy;
  sort_order?: SortOrder;
}

export interface CreateBusinessTypeInput {
  name: string;
  code?: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateBusinessTypeInput {
  name?: string;
  code?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface AppRole {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean | number;
}
