import type { PaginatedData, ListParams } from "@/types/api";
import type { Product } from "@/types/product";
import { apiClientGet } from "@/utils/api-client";

export interface ProductListParams extends ListParams {
  subcategory_id?: number;
  category_id?: number;
}

export const productsService = {
  async getProducts(
    params: ProductListParams = {}
  ): Promise<PaginatedData<Product>> {
    return apiClientGet<PaginatedData<Product>>("/api/products", {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      is_active: params.is_active,
      subcategory_id: params.subcategory_id,
      category_id: params.category_id,
    });
  },
};
