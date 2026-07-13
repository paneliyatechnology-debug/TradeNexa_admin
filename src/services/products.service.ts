import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { PaginatedData, ProductListParams } from "@/types/api";
import type {
  AdminProductDecisionInput,
  AdminProductDecisionResult,
  AdminReviewListParams,
  Product,
  ProductDetail,
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
    return apiClientGet<ProductDetail>(productDetailUrl(id));
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
