import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData, ProductListParams } from "@/types/api";
import type { Product } from "@/types/product";
import { apiClientGet } from "@/utils/api-client";

const PRODUCTS_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.products.list}`;

export const productsService = {
  async getProducts(params: ProductListParams = {}): Promise<PaginatedData<Product>> {
    return apiClientGet<PaginatedData<Product>>(PRODUCTS_LIST_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      subcategory_id: params.subcategory_id,
      category_id: params.category_id,
    });
  },
};
