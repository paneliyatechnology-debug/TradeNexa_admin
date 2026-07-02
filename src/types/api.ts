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
