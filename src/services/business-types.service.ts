import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData } from "@/types/api";
import type {
  BusinessType,
  BusinessTypeDetail,
  BusinessTypeListParams,
  CreateBusinessTypeInput,
  UpdateBusinessTypeInput,
  AppRole,
} from "@/types/business-type";
import {
  apiClientDelete,
  apiClientGet,
  apiClientPost,
  apiClientPut,
} from "@/utils/api-client";

const BUSINESS_TYPES_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.businessTypes.list}`;
const businessTypeDetailUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.businessTypes.detail(id)}`;
const ROLES_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.roles.list}`;

export const businessTypesService = {
  async getBusinessTypes(params: BusinessTypeListParams = {}): Promise<PaginatedData<BusinessType>> {
    return apiClientGet<PaginatedData<BusinessType>>(BUSINESS_TYPES_LIST_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      role_id: params.role_id,
      exact_role: params.role_id ? true : undefined,
      is_active: params.is_active === undefined ? undefined : params.is_active,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });
  },

  async getBusinessType(id: number): Promise<BusinessTypeDetail> {
    return apiClientGet<BusinessTypeDetail>(businessTypeDetailUrl(id));
  },

  async createBusinessType(payload: CreateBusinessTypeInput): Promise<BusinessType> {
    return apiClientPost<BusinessType>(BUSINESS_TYPES_LIST_URL, payload);
  },

  async updateBusinessType(id: number, payload: UpdateBusinessTypeInput): Promise<BusinessType> {
    return apiClientPut<BusinessType>(businessTypeDetailUrl(id), payload);
  },

  async deleteBusinessType(id: number): Promise<void> {
    await apiClientDelete<null>(businessTypeDetailUrl(id));
  },

  async bulkDeleteBusinessTypes(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    try {
      await apiClientPost<{ message?: string; deletedCount?: number }>(
        `${API_BASE_URL}${API_ENDPOINTS.businessTypes.bulkDelete}`,
        { ids }
      );
    } catch {
      // Fallback for live backend if bulk endpoint is not yet deployed
      await Promise.all(ids.map((id) => this.deleteBusinessType(id)));
    }
  },

  async deleteAllBusinessTypes(): Promise<void> {
    try {
      await apiClientDelete<{ message?: string }>(
        `${API_BASE_URL}${API_ENDPOINTS.businessTypes.all}`
      );
    } catch {
      // Fallback: fetch current business types and delete all
      const res = await this.getBusinessTypes({ limit: 1000 });
      const ids = (res.results || []).map((item) => item.id);
      if (ids.length > 0) {
        await Promise.all(ids.map((id) => this.deleteBusinessType(id)));
      }
    }
  },

  async getRoles(): Promise<PaginatedData<AppRole>> {
    return apiClientGet<PaginatedData<AppRole>>(ROLES_LIST_URL, {
      limit: 50,
      is_active: true,
    });
  },
};
