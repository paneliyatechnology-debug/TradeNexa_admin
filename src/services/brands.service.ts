import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData } from "@/types/api";
import type {
  Brand,
  BrandDetail,
  BrandListParams,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/types/brand";
import {
  apiClientDelete,
  apiClientGet,
  apiClientPostFormData,
  apiClientPutFormData,
} from "@/utils/api-client";

const BRANDS_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.brands.list}`;
const brandDetailUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.brands.detail(id)}`;

function buildBrandFormData(
  payload: CreateBrandInput | UpdateBrandInput
): FormData {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("is_popular", String(payload.is_popular));

  if ("logo" in payload && payload.logo instanceof File) {
    formData.append("logo", payload.logo);
  } else if ("clear_logo" in payload && payload.clear_logo) {
    formData.append("logo", "");
  }

  return formData;
}

export const brandsService = {
  async getBrands(params: BrandListParams = {}): Promise<PaginatedData<Brand>> {
    return apiClientGet<PaginatedData<Brand>>(BRANDS_LIST_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      is_popular: params.is_popular,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });
  },

  async getBrand(id: number): Promise<BrandDetail> {
    return apiClientGet<BrandDetail>(brandDetailUrl(id));
  },

  async createBrand(payload: CreateBrandInput): Promise<Brand> {
    return apiClientPostFormData<Brand>(BRANDS_LIST_URL, buildBrandFormData(payload));
  },

  async updateBrand(id: number, payload: UpdateBrandInput): Promise<Brand> {
    return apiClientPutFormData<Brand>(brandDetailUrl(id), buildBrandFormData(payload));
  },

  async deleteBrand(id: number): Promise<void> {
    await apiClientDelete<null>(brandDetailUrl(id));
  },
};
