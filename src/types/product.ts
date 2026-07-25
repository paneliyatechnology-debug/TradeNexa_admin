import type { SortOrder } from "@/types/api";

export interface Product {
  id: number;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  currency: string;
  moq: number;
  unit: string;
  supplier_name: string;
  verified: boolean;
  rating: number;
  city: string | null;
  state: string | null;
  is_trending: boolean;
  created_at: string;
}

export type ProductSortBy =
  | "id"
  | "name"
  | "supplier_name"
  | "price"
  | "moq"
  | "rating"
  | "verified"
  | "is_trending"
  | "created_at";

export const PRODUCT_SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "name", label: "Name" },
  { value: "supplier_name", label: "Supplier" },
  { value: "price", label: "Price" },
  { value: "moq", label: "MOQ" },
  { value: "rating", label: "Rating" },
  { value: "verified", label: "Verified" },
  { value: "is_trending", label: "Trending" },
  { value: "created_at", label: "Created" },
];

/** Moderation decision state on a product listing. */
export type ProductApprovalStatus =
  | "in_review"
  | "revision_required"
  | "approved"
  | "rejected";

export type ProductReviewAction =
  | "submitted"
  | "resubmitted"
  | "approved"
  | "revision_required"
  | "rejected";

export type ProductReviewActorRole =
  | "seller"
  | "buyer_seller"
  | "admin"
  | "super_admin"
  | "supporter";

export type AdminReviewSortBy =
  | "id"
  | "name"
  | "slug"
  | "price"
  | "moq"
  | "rating"
  | "is_trending"
  | "created_at"
  | "updated_at"
  | "submitted_at"
  | "reviewed_at"
  | "seller_name";

export const ADMIN_REVIEW_SORT_OPTIONS: {
  value: AdminReviewSortBy;
  label: string;
}[] = [
  { value: "submitted_at", label: "Submitted" },
  { value: "reviewed_at", label: "Reviewed" },
  { value: "name", label: "Name" },
  { value: "seller_name", label: "Seller" },
  { value: "price", label: "Price" },
  { value: "moq", label: "MOQ" },
  { value: "rating", label: "Rating" },
  { value: "is_trending", label: "Trending" },
  { value: "created_at", label: "Created" },
  { value: "updated_at", label: "Updated" },
  { value: "id", label: "ID" },
  { value: "slug", label: "Slug" },
];

export const PRODUCT_APPROVAL_STATUS_OPTIONS: {
  value: ProductApprovalStatus | "all";
  label: string;
}[] = [
  { value: "in_review", label: "In review" },
  { value: "revision_required", label: "Revision required" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export interface ProductApprovalFields {
  approval_status: ProductApprovalStatus;
  review_version: number;
  submitted_at: string | null;
  resubmitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  latest_review_remarks: string | null;
  is_active: boolean;
}

/** Product row in the admin moderation queue. */
export interface ProductReviewItem extends Product, ProductApprovalFields {
  seller_id?: number | null;
  seller_name?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  brand_id?: number | null;
  brand_name?: string | null;
  updated_at?: string;
}

export interface ProductGalleryImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface ProductSellerInfo {
  id: number | null;
  company_name: string | null;
  company_logo: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address_line_1: string | null;
  pincode: string | null;
}

/** Full product detail (admin can view any approval status). Flat view model. */
export interface ProductDetail extends ProductReviewItem {
  short_description?: string | null;
  description?: string | null;
  subcategory_id?: number | null;
  subcategory_name?: string | null;
  material?: string | null;
  country_of_origin?: string | null;
  product_condition?: string | null;
  specifications?: Record<string, unknown> | Array<unknown> | null;
  search_tags?: string[] | null;
  hsn_code?: string | null;
  gst_percentage?: number | null;
  warranty?: string | null;
  show_price?: boolean;
  accept_inquiry?: boolean;
  stock_quantity?: number | null;
  stock_status?: string | null;
  deleted_at?: string | null;
  gallery?: ProductGalleryImage[];
  brand_logo?: string | null;
  brand_website?: string | null;
  brand_country?: string | null;
  seller?: ProductSellerInfo | null;
}

/** Raw nested payload from GET /products/:id */
export interface ProductDetailApiResponse {
  id: number;
  slug?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  basic_details?: {
    name?: string | null;
    short_description?: string | null;
    description?: string | null;
    brand?: {
      id?: number;
      name?: string | null;
      slug?: string | null;
      website?: string | null;
      country?: string | null;
      logo?: string | null;
    } | null;
    category?: { id?: number; name?: string | null } | null;
    subcategory?: { id?: number; name?: string | null } | null;
    country_of_origin?: string | null;
    material?: string | null;
    product_condition?: string | null;
  } | null;
  pricing?: {
    price?: number | null;
    currency?: string | null;
    minimum_order_quantity?: number | null;
    unit?: string | null;
    gst_percentage?: number | null;
    hsn_code?: string | null;
    show_price?: boolean | null;
  } | null;
  inventory?: {
    stock_status?: string | null;
    stock_quantity?: number | null;
  } | null;
  images?: {
    thumbnail?: string | null;
    gallery?: Array<{
      id?: number;
      url?: string | null;
      is_primary?: boolean;
    }> | null;
  } | null;
  seller?: {
    id?: number | null;
    user_id?: number | null;
    company?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    contact?: {
      phone?: string | null;
      email?: string | null;
    } | null;
    address?: {
      address_line_1?: string | null;
      pincode?: string | null;
      country?: string | null;
      state?: string | null;
      city?: string | null;
    } | null;
  } | null;
  marketplace?: {
    is_trending?: boolean | null;
    accept_inquiry?: boolean | null;
    is_active?: boolean | null;
  } | null;
  approval?: {
    status?: ProductApprovalStatus | string | null;
    review_version?: number | null;
    submitted_at?: string | null;
    resubmitted_at?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: number | null;
    latest_review_remarks?: string | null;
  } | null;
  warranty?: string | null;
  search_tags?: string[] | null;
  specifications?: Record<string, unknown> | Array<unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Flat legacy fallback fields
  name?: string | null;
  thumbnail?: string | null;
  price?: number | null;
  currency?: string | null;
  moq?: number | null;
  unit?: string | null;
  supplier_name?: string | null;
  seller_name?: string | null;
  approval_status?: ProductApprovalStatus | string | null;
  review_version?: number | null;
  submitted_at?: string | null;
  resubmitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
  latest_review_remarks?: string | null;
  is_active?: boolean | null;
  is_trending?: boolean | null;
  category_name?: string | null;
  brand_name?: string | null;
  subcategory_name?: string | null;
  short_description?: string | null;
  description?: string | null;
  material?: string | null;
  country_of_origin?: string | null;
  product_condition?: string | null;
  hsn_code?: string | null;
  gst_percentage?: number | null;
  show_price?: boolean | null;
  accept_inquiry?: boolean | null;
  stock_quantity?: number | null;
  stock_status?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Defaults to `in_review` on the backend when omitted. */
  approval_status?: ProductApprovalStatus | "all";
  sort_by?: AdminReviewSortBy;
  sort_order?: SortOrder;
  category_id?: number;
  brand_id?: number;
  seller_id?: number;
}

export interface ProductReviewHistoryEntry {
  id: number;
  product_id: number;
  review_version: number;
  action: ProductReviewAction;
  from_status: ProductApprovalStatus | null;
  to_status: ProductApprovalStatus;
  remarks: string | null;
  actor_id: number | null;
  actor_role: ProductReviewActorRole | string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface ProductReviewHistoryParams {
  page?: number;
  limit?: number;
}

/** Shared body for approve / request-revision / reject (max 100 IDs). */
export interface AdminProductDecisionInput {
  product_ids: number[];
  remarks?: string;
}

export interface AdminProductDecisionSuccessItem {
  id: number;
  approval_status: ProductApprovalStatus;
}

export interface AdminProductDecisionFailedItem {
  id: number;
  message: string;
}

/** Partial success is allowed — each ID is processed independently. */
export interface AdminProductDecisionResult {
  succeeded: AdminProductDecisionSuccessItem[];
  failed: AdminProductDecisionFailedItem[];
  total: number;
}
