/**
 * ==============================================================================
 * TradeNexa Admin - API & Server URL Configuration
 * ==============================================================================
 */

export const URL_CONFIG = {
  local: {
    origin: "http://localhost:5000",
    apiUrl: "http://localhost:5000/api/v1",
  },
  live: {
    origin: "https://tradenexabackend-production.up.railway.app",
    apiUrl: "https://tradenexabackend-production.up.railway.app/api/v1",
  },
} as const;


export type AppEnvironment = keyof typeof URL_CONFIG;

// ==============================================================================
// ⚙️ MANUAL TOGGLE
// ==============================================================================

const DEFAULT_ENV: AppEnvironment = "live";

function normalizeBaseUrl(url: unknown, fallback: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }

  let cleaned = url.trim().replace(/\/+$/, "");

  // Prevent accidentally using old production Railway URL
  if (cleaned.includes("tradenexabackend-production.up.railway.app")) {
    cleaned = cleaned.replace(
      "tradenexabackend-production.up.railway.app",
      "tradenexabackend-production.up.railway.app"
    );
  }

  return cleaned || fallback;
}

// ==============================================================================
// Environment
// ==============================================================================

const envOverride = process.env.NEXT_PUBLIC_ENV
  ?.toLowerCase()
  ?.trim() as AppEnvironment | undefined;

export const CURRENT_ENV: AppEnvironment =
  envOverride && URL_CONFIG[envOverride]
    ? envOverride
    : DEFAULT_ENV;

export const IS_LIVE = CURRENT_ENV === "live";

// ==============================================================================
// Backend URLs
// ==============================================================================

const defaultOrigin = URL_CONFIG[CURRENT_ENV].origin;
const defaultApiUrl = URL_CONFIG[CURRENT_ENV].apiUrl;

/**
 * Backend root origin
 *
 * Local:
 * http://localhost:5000
 *
 * Live:
 * https://tradenexabackend-dev.up.railway.app
 */
export const BACKEND_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ??
  defaultOrigin,
  defaultOrigin
);

/**
 * Full backend API base URL.
 *
 * Local dev:  Set NEXT_PUBLIC_API_BASE_URL=/api/v1 in .env.local
 *             → Next.js proxy forwards to Railway (no CORS)
 *
 * Production: Leave unset → falls back to full Railway URL
 */
export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL,
  `${BACKEND_URL}/api/v1`
);


// ==============================================================================
// API Endpoints
// ==============================================================================

export const API_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: "/admin/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh-token",
    profile: "/auth/profile",
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    admin: "/dashboard/admin",
    seller: "/dashboard/seller",
  },

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    list: "/products",
    detail: (id: number | string) => `/products/${id}`,
    reviews: (id: number | string) => `/products/${id}/reviews`,
    admin: {
      reviews: "/products/admin/reviews",
      approve: "/products/admin/approve",
      requestRevision: "/products/admin/request-revision",
      reject: "/products/admin/reject",
    },
  },

  // ── Categories ────────────────────────────────────────────────────────────
  categories: {
    list: "/categories",
    detail: (id: number | string) => `/categories/${id}`,
    subcategories: (id: number | string) => `/categories/${id}/subcategories`,
    subcategory: (categoryId: number | string, subId: number | string) =>
      `/categories/${categoryId}/subcategories/${subId}`,
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  banners: {
    list: "/banners",
    detail: (id: number | string) => `/banners/${id}`,
  },

  // ── Brands ────────────────────────────────────────────────────────────────
  brands: {
    list: "/brands",
    detail: (id: number | string) => `/brands/${id}`,
  },

  // ── Business Types ────────────────────────────────────────────────────────
  businessTypes: {
    list: "/business-types",
    detail: (id: number | string) => `/business-types/${id}`,
    bulkDelete: "/business-types/bulk-delete",
    all: "/business-types/all",
  },

  // ── Offers ────────────────────────────────────────────────────────────────
  offers: {
    list: "/offers",
    detail: (id: number | string) => `/offers/${id}`,
  },

  // ── Roles ─────────────────────────────────────────────────────────────────
  roles: {
    list: "/roles",
  },
} as const;

// ==============================================================================
// Console Debug
// ==============================================================================

if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
  console.log(
    `[TradeNexa Admin] 🌐 Active ENV: ${CURRENT_ENV.toUpperCase()} | API: ${API_BASE_URL}`
  );
}