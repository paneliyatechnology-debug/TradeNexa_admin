import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData } from "@/types/api";
import type {
  Banner,
  BannerListParams,
  CreateBannerInput,
  UpdateBannerInput,
} from "@/types/banner";
import {
  apiClientDelete,
  apiClientGet,
  apiClientPostFormData,
  apiClientPutFormData,
} from "@/utils/api-client";

const BANNERS_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.banners.list}`;
const bannerDetailUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.banners.detail(id)}`;

function buildBannerFormData(
  payload: CreateBannerInput | UpdateBannerInput
): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);

  if (payload.redirect_type !== null) {
    formData.append("redirect_type", payload.redirect_type);
  }

  if (payload.redirect_id !== null) {
    formData.append("redirect_id", String(payload.redirect_id));
  }

  formData.append("priority", String(payload.priority));

  if ("image" in payload && payload.image instanceof File) {
    formData.append("image", payload.image);
  } else if ("clear_image" in payload && payload.clear_image) {
    formData.append("image", "");
  }

  return formData;
}

export const bannersService = {
  async getBanners(params: BannerListParams = {}): Promise<PaginatedData<Banner>> {
    return apiClientGet<PaginatedData<Banner>>(BANNERS_LIST_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });
  },

  async getBanner(id: number): Promise<Banner> {
    return apiClientGet<Banner>(bannerDetailUrl(id));
  },

  async createBanner(payload: CreateBannerInput): Promise<Banner> {
    return apiClientPostFormData<Banner>(
      BANNERS_LIST_URL,
      buildBannerFormData(payload)
    );
  },

  async updateBanner(id: number, payload: UpdateBannerInput): Promise<Banner> {
    return apiClientPutFormData<Banner>(
      bannerDetailUrl(id),
      buildBannerFormData(payload)
    );
  },

  async deleteBanner(id: number): Promise<void> {
    await apiClientDelete<null>(bannerDetailUrl(id));
  },
};
