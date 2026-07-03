export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  results: T[];
  pagination: ApiPagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export type SortOrder = "asc" | "desc";

export interface CategoryListParams extends ListParams {
  search?: string;
  sort_by?: "name";
  sort_order?: SortOrder;
}

export type SubcategoryListParams = CategoryListParams;

import type { ProductSortBy } from "@/types/product";

export interface ProductListParams extends ListParams {
  search?: string;
  sort_by?: ProductSortBy;
  sort_order?: SortOrder;
  subcategory_id?: number;
  category_id?: number;
}
