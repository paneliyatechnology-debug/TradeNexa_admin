import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData } from "@/types/api";
import type {
  CreateOfferInput,
  Offer,
  OfferDetail,
  OfferListParams,
  UpdateOfferInput,
} from "@/types/offer";
import {
  apiClientDelete,
  apiClientGet,
  apiClientPostFormData,
  apiClientPutFormData,
} from "@/utils/api-client";

const OFFERS_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.offers.list}`;
const offerDetailUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.offers.detail(id)}`;

function buildOfferFormData(payload: CreateOfferInput | UpdateOfferInput): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("discount", String(payload.discount));
  formData.append("expiry_date", payload.expiry_date);

  if ("banner" in payload && payload.banner instanceof File) {
    formData.append("banner", payload.banner);
  } else if ("clear_banner" in payload && payload.clear_banner) {
    formData.append("banner", "");
  }

  return formData;
}

export const offersService = {
  async getOffers(params: OfferListParams = {}): Promise<PaginatedData<Offer>> {
    return apiClientGet<PaginatedData<Offer>>(OFFERS_LIST_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      include_expired: params.include_expired ?? false,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });
  },

  async getOffer(id: number): Promise<OfferDetail> {
    return apiClientGet<OfferDetail>(offerDetailUrl(id));
  },

  async createOffer(payload: CreateOfferInput): Promise<Offer> {
    return apiClientPostFormData<Offer>(OFFERS_LIST_URL, buildOfferFormData(payload));
  },

  async updateOffer(id: number, payload: UpdateOfferInput): Promise<Offer> {
    return apiClientPutFormData<Offer>(offerDetailUrl(id), buildOfferFormData(payload));
  },

  async deleteOffer(id: number): Promise<void> {
    await apiClientDelete<null>(offerDetailUrl(id));
  },
};
