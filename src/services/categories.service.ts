import type { PaginatedData, ListParams } from "@/types/api";
import type { Category, CreateCategoryInput, Subcategory } from "@/types/category";
import { apiClientGet, apiClientPostFormData } from "@/utils/api-client";

function buildCategoryFormData(payload: CreateCategoryInput): FormData {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("is_active", String(payload.is_active));

  if (payload.icon) {
    formData.append("icon", payload.icon);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return formData;
}

export const categoriesService = {
  async getCategories(
    params: ListParams = {}
  ): Promise<PaginatedData<Category>> {
    return apiClientGet<PaginatedData<Category>>("/api/categories", {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      is_active: params.is_active,
    });
  },

  async getSubcategories(
    categoryId: number,
    params: ListParams = {}
  ): Promise<PaginatedData<Subcategory>> {
    return apiClientGet<PaginatedData<Subcategory>>(
      `/api/categories/${categoryId}/subcategories`,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        is_active: params.is_active,
      }
    );
  },

  async createCategory(payload: CreateCategoryInput): Promise<Category> {
    return apiClientPostFormData<Category>(
      "/api/categories",
      buildCategoryFormData(payload)
    );
  },

  async createSubcategory(
    categoryId: number,
    payload: CreateCategoryInput
  ): Promise<Subcategory> {
    return apiClientPostFormData<Subcategory>(
      `/api/categories/${categoryId}/subcategories`,
      buildCategoryFormData(payload)
    );
  },
};
