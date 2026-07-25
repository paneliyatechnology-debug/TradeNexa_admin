import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData, ProductListParams } from "@/types/api";
import type {
  AdminProductDecisionInput,
  AdminProductDecisionResult,
  AdminReviewListParams,
  Product,
  ProductApprovalStatus,
  ProductDetail,
  ProductDetailApiResponse,
  ProductGalleryImage,
  ProductReviewHistoryEntry,
  ProductReviewHistoryParams,
  ProductReviewItem,
} from "@/types/product";
import { apiClientGet, apiClientPost } from "@/utils/api-client";

const PRODUCTS_LIST_URL = `${API_BASE_URL}${API_ENDPOINTS.products.list}`;
const ADMIN_REVIEWS_URL = `${API_BASE_URL}${API_ENDPOINTS.products.admin.reviews}`;
const ADMIN_APPROVE_URL = `${API_BASE_URL}${API_ENDPOINTS.products.admin.approve}`;
const ADMIN_REQUEST_REVISION_URL = `${API_BASE_URL}${API_ENDPOINTS.products.admin.requestRevision}`;
const ADMIN_REJECT_URL = `${API_BASE_URL}${API_ENDPOINTS.products.admin.reject}`;

const productDetailUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.products.detail(id)}`;
const productReviewsUrl = (id: number | string) =>
  `${API_BASE_URL}${API_ENDPOINTS.products.reviews(id)}`;

const MAX_DECISION_IDS = 100;

const APPROVAL_STATUSES = new Set<ProductApprovalStatus>([
  "in_review",
  "revision_required",
  "approved",
  "rejected",
]);

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function asApprovalStatus(value: unknown): ProductApprovalStatus {
  const status = String(value ?? "").trim().toLowerCase();
  if (APPROVAL_STATUSES.has(status as ProductApprovalStatus)) {
    return status as ProductApprovalStatus;
  }
  return "in_review";
}

/** Maps nested GET /products/:id payload into the flat ProductDetail view model. */
export function normalizeProductDetail(
  raw: ProductDetailApiResponse
): ProductDetail {
  const basic = raw.basic_details ?? {};
  const pricing = raw.pricing ?? {};
  const inventory = raw.inventory ?? {};
  const images = raw.images ?? {};
  const marketplace = raw.marketplace ?? {};
  const approval = raw.approval ?? {};
  const sellerRaw = raw.seller ?? null;

  const gallery: ProductGalleryImage[] = Array.isArray(images.gallery)
    ? images.gallery
        .map((item) => {
          const url = asText(item?.url);
          if (!url) return null;
          return {
            id: asNumber(item?.id),
            url,
            is_primary: Boolean(item?.is_primary),
          };
        })
        .filter((item): item is ProductGalleryImage => item != null)
    : [];

  const thumbnail =
    asText(images.thumbnail) ??
    gallery.find((item) => item.is_primary)?.url ??
    gallery[0]?.url ??
    asText(raw.thumbnail);

  const sellerName =
    asText(sellerRaw?.company?.name) ??
    asText(raw.seller_name) ??
    asText(raw.supplier_name);

  const city = asText(sellerRaw?.address?.city) ?? asText(raw.city);
  const state = asText(sellerRaw?.address?.state) ?? asText(raw.state);

  return {
    id: asNumber(raw.id),
    name: asText(basic.name) ?? asText(raw.name) ?? `Product #${raw.id}`,
    slug: asText(raw.slug) ?? "",
    thumbnail,
    price: asNumber(pricing.price ?? raw.price, 0),
    currency: asText(pricing.currency) ?? asText(raw.currency) ?? "INR",
    moq: asNumber(pricing.minimum_order_quantity ?? raw.moq, 0),
    unit: asText(pricing.unit) ?? asText(raw.unit) ?? "",
    supplier_name: sellerName ?? "",
    verified: false,
    rating: 0,
    city,
    state,
    is_trending: Boolean(marketplace.is_trending ?? raw.is_trending),
    created_at: asText(raw.created_at) ?? "",
    updated_at: asText(raw.updated_at) ?? undefined,
    approval_status: asApprovalStatus(approval.status ?? raw.approval_status),
    review_version: asNumber(approval.review_version ?? raw.review_version, 1),
    submitted_at: asText(approval.submitted_at) ?? asText(raw.submitted_at),
    resubmitted_at:
      asText(approval.resubmitted_at) ?? asText(raw.resubmitted_at),
    reviewed_at: asText(approval.reviewed_at) ?? asText(raw.reviewed_at),
    reviewed_by: asNullableNumber(approval.reviewed_by ?? raw.reviewed_by),
    latest_review_remarks:
      asText(approval.latest_review_remarks) ??
      asText(raw.latest_review_remarks),
    is_active: Boolean(marketplace.is_active ?? raw.is_active ?? true),
    seller_id: asNullableNumber(sellerRaw?.id ?? sellerRaw?.user_id),
    seller_name: sellerName,
    category_id: asNullableNumber(raw.category_id ?? basic.category?.id),
    category_name: asText(basic.category?.name) ?? asText(raw.category_name),
    brand_id: asNullableNumber(basic.brand?.id),
    brand_name: asText(basic.brand?.name) ?? asText(raw.brand_name),
    brand_logo: asText(basic.brand?.logo),
    brand_website: asText(basic.brand?.website),
    brand_country: asText(basic.brand?.country),
    subcategory_id: asNullableNumber(
      raw.subcategory_id ?? basic.subcategory?.id
    ),
    subcategory_name:
      asText(basic.subcategory?.name) ?? asText(raw.subcategory_name),
    short_description:
      asText(basic.short_description) ?? asText(raw.short_description),
    description: asText(basic.description) ?? asText(raw.description),
    material: asText(basic.material) ?? asText(raw.material),
    country_of_origin:
      asText(basic.country_of_origin) ?? asText(raw.country_of_origin),
    product_condition:
      asText(basic.product_condition) ?? asText(raw.product_condition),
    hsn_code: asText(pricing.hsn_code) ?? asText(raw.hsn_code),
    gst_percentage: asNullableNumber(
      pricing.gst_percentage ?? raw.gst_percentage
    ),
    show_price: Boolean(pricing.show_price ?? raw.show_price ?? true),
    accept_inquiry: Boolean(
      marketplace.accept_inquiry ?? raw.accept_inquiry ?? true
    ),
    stock_quantity: asNullableNumber(
      inventory.stock_quantity ?? raw.stock_quantity
    ),
    stock_status: asText(inventory.stock_status) ?? asText(raw.stock_status),
    warranty: asText(raw.warranty),
    search_tags: Array.isArray(raw.search_tags) ? raw.search_tags : [],
    specifications: raw.specifications ?? null,
    gallery,
    seller: sellerRaw
      ? {
          id: asNullableNumber(sellerRaw.id),
          company_name: asText(sellerRaw.company?.name),
          company_logo: asText(sellerRaw.company?.logo),
          email: asText(sellerRaw.contact?.email),
          phone: asText(sellerRaw.contact?.phone),
          city: asText(sellerRaw.address?.city),
          state: asText(sellerRaw.address?.state),
          country: asText(sellerRaw.address?.country),
          address_line_1: asText(sellerRaw.address?.address_line_1),
          pincode: asText(sellerRaw.address?.pincode),
        }
      : null,
  };
}

function normalizeDecisionInput(
  input: AdminProductDecisionInput
): AdminProductDecisionInput {
  const product_ids = [...new Set(input.product_ids)].filter(
    (id) => Number.isFinite(id) && id > 0
  );

  if (product_ids.length === 0) {
    throw new Error("At least one product ID is required.");
  }

  if (product_ids.length > MAX_DECISION_IDS) {
    throw new Error(`A maximum of ${MAX_DECISION_IDS} product IDs is allowed.`);
  }

  const remarks = input.remarks?.trim();
  return {
    product_ids,
    ...(remarks ? { remarks } : {}),
  };
}

function requireRemarks(
  input: AdminProductDecisionInput,
  minLength = 10
): AdminProductDecisionInput {
  const normalized = normalizeDecisionInput(input);
  const remarks = normalized.remarks?.trim() ?? "";

  if (remarks.length < minLength) {
    throw new Error(`Remarks are required (minimum ${minLength} characters).`);
  }

  return { ...normalized, remarks };
}

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

  /** GET /products/:id — admin can view any approval status. */
  async getProduct(id: number | string): Promise<ProductDetail> {
    const data = await apiClientGet<ProductDetailApiResponse>(
      productDetailUrl(id)
    );
    return normalizeProductDetail(data);
  },

  /**
   * GET /products/admin/reviews
   * Moderation queue. Defaults to `approval_status=in_review` on the backend.
   */
  async getAdminReviews(
    params: AdminReviewListParams = {}
  ): Promise<PaginatedData<ProductReviewItem>> {
    return apiClientGet<PaginatedData<ProductReviewItem>>(ADMIN_REVIEWS_URL, {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      approval_status: params.approval_status,
      sort_by: params.sort_by ?? "submitted_at",
      sort_order: params.sort_order ?? "desc",
      category_id: params.category_id,
      brand_id: params.brand_id,
      seller_id: params.seller_id,
    });
  },

  /**
   * GET /products/:id/reviews
   * Append-only review timeline (owner or admin).
   */
  async getProductReviews(
    id: number | string,
    params: ProductReviewHistoryParams = {}
  ): Promise<PaginatedData<ProductReviewHistoryEntry>> {
    return apiClientGet<PaginatedData<ProductReviewHistoryEntry>>(
      productReviewsUrl(id),
      {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }
    );
  },

  /**
   * POST /products/admin/approve
   * `in_review` → `approved`. Remarks optional (10–2000 chars if sent).
   */
  async approveProducts(
    input: AdminProductDecisionInput
  ): Promise<AdminProductDecisionResult> {
    const body = normalizeDecisionInput(input);

    if (body.remarks && body.remarks.length < 10) {
      throw new Error("Remarks must be at least 10 characters when provided.");
    }

    return apiClientPost<AdminProductDecisionResult>(ADMIN_APPROVE_URL, body);
  },

  /**
   * POST /products/admin/request-revision
   * `in_review` → `revision_required`. Remarks required (min 10).
   */
  async requestProductRevision(
    input: AdminProductDecisionInput
  ): Promise<AdminProductDecisionResult> {
    return apiClientPost<AdminProductDecisionResult>(
      ADMIN_REQUEST_REVISION_URL,
      requireRemarks(input)
    );
  },

  /**
   * POST /products/admin/reject
   * `in_review` → `rejected` (terminal). Remarks required (min 10).
   */
  async rejectProducts(
    input: AdminProductDecisionInput
  ): Promise<AdminProductDecisionResult> {
    return apiClientPost<AdminProductDecisionResult>(
      ADMIN_REJECT_URL,
      requireRemarks(input)
    );
  },
};
