import { CLIENT_API_ROUTES } from "@/config/api";
import type { CategoryListParams, PaginatedData, SubcategoryListParams } from "@/types/api";
import type {
  Category,
  CategoryDetail,
  CreateCategoryInput,
  Subcategory,
  SubcategoryDetail,
  UpdateCategoryInput,
} from "@/types/category";
import {
  apiClientDelete,
  apiClientGet,
  apiClientPostFormData,
  apiClientPutFormData,
} from "@/utils/api-client";

function buildCategoryFormData(
  payload: (CreateCategoryInput | UpdateCategoryInput) & {
    clear_icon?: boolean;
    clear_image?: boolean;
  }
): FormData {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("is_active", String(payload.is_active));

  if (payload.icon) {
    formData.append("icon", payload.icon);
  } else if (payload.clear_icon) {
    formData.append("icon", "");
  }

  if (payload.image) {
    formData.append("image", payload.image);
  } else if (payload.clear_image) {
    formData.append("image", "");
  }

  return formData;
}

export const categoriesService = {
  async getCategories(
    params: CategoryListParams = {}
  ): Promise<PaginatedData<Category>> {
    return apiClientGet<PaginatedData<Category>>(
      CLIENT_API_ROUTES.categories.list,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        is_active: params.is_active,
        search: params.search || undefined,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      }
    );
  },

  async getCategory(categoryId: number): Promise<CategoryDetail> {
    return apiClientGet<CategoryDetail>(
      CLIENT_API_ROUTES.categories.detail(categoryId)
    );
  },

  async getSubcategories(
    categoryId: number,
    params: SubcategoryListParams = {}
  ): Promise<PaginatedData<Subcategory>> {
    return apiClientGet<PaginatedData<Subcategory>>(
      CLIENT_API_ROUTES.categories.subcategories(categoryId),
      {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        is_active: params.is_active,
        search: params.search || undefined,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      }
    );
  },

  async getSubcategory(
    categoryId: number,
    subcategoryId: number
  ): Promise<SubcategoryDetail> {
    return apiClientGet<SubcategoryDetail>(
      CLIENT_API_ROUTES.categories.subcategory(categoryId, subcategoryId)
    );
  },

  async createCategory(payload: CreateCategoryInput): Promise<Category> {
    return apiClientPostFormData<Category>(
      CLIENT_API_ROUTES.categories.list,
      buildCategoryFormData(payload)
    );
  },

  async createSubcategory(
    categoryId: number,
    payload: CreateCategoryInput
  ): Promise<Subcategory> {
    return apiClientPostFormData<Subcategory>(
      CLIENT_API_ROUTES.categories.subcategories(categoryId),
      buildCategoryFormData(payload)
    );
  },

  async updateCategory(
    categoryId: number,
    payload: UpdateCategoryInput
  ): Promise<Category> {
    return apiClientPutFormData<Category>(
      CLIENT_API_ROUTES.categories.detail(categoryId),
      buildCategoryFormData(payload)
    );
  },

  async updateSubcategory(
    categoryId: number,
    subcategoryId: number,
    payload: UpdateCategoryInput
  ): Promise<Subcategory> {
    return apiClientPutFormData<Subcategory>(
      CLIENT_API_ROUTES.categories.subcategory(categoryId, subcategoryId),
      buildCategoryFormData(payload)
    );
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await apiClientDelete<null>(
      CLIENT_API_ROUTES.categories.detail(categoryId)
    );
  },

  async deleteSubcategory(categoryId: number, subcategoryId: number): Promise<void> {
    await apiClientDelete<null>(
      CLIENT_API_ROUTES.categories.subcategory(categoryId, subcategoryId)
    );
  },
};
