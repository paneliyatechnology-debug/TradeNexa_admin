/**
 * ==============================================================================
 * TradeNexa Admin - API & Server URL Configuration
 * ==============================================================================
 * 
 * Aap yahan se easily Local (Testing) aur Live (Production) URL switch kar sakte hain.
 * 
 * 1. DIRECT TOGGLE:
 *    Neeche diye gaye `DEFAULT_ENV` ko 'local' ya 'live' set karein.
 * 
 * 2. YA .env FILE SE:
 *    .env.local me `NEXT_PUBLIC_ENV=local` ya `NEXT_PUBLIC_ENV=live` likhein.
 */

export const URL_CONFIG = {
  local: {
    origin: "http://localhost:5000",
    apiUrl: "http://localhost:5000/api/v1",
  },
  live: {
    origin: "https://tradenexabackend-dev.up.railway.app",
    apiUrl: "https://tradenexabackend-dev.up.railway.app/api/v1",
  },
} as const;

export type AppEnvironment = keyof typeof URL_CONFIG;

// ==============================================================================
// ⚙️ MANUAL TOGGLE (Yahan change karke toggle kar sakte hain):
// Set to 'local' for testing, or 'live' for production
// ==============================================================================
const DEFAULT_ENV: AppEnvironment = "live"; // 👈 Change to 'live' for production

function normalizeBaseUrl(url: unknown, fallback: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }
  let cleaned = url.trim().replace(/\/+$/, "");
  if (cleaned.includes("tradenexabackend-production.up.railway.app")) {
    cleaned = cleaned.replace("tradenexabackend-production.up.railway.app", "tradenexabackend-dev.up.railway.app");
  }
  return cleaned || fallback;
}

// Check environment variables first (allows override via .env or hosting provider)
const envOverride = process.env.NEXT_PUBLIC_ENV?.toLowerCase()?.trim() as AppEnvironment | undefined;
export const CURRENT_ENV: AppEnvironment =
  envOverride && URL_CONFIG[envOverride] ? envOverride : DEFAULT_ENV;

export const IS_LIVE = CURRENT_ENV === "live";

const defaultOrigin = URL_CONFIG[CURRENT_ENV].origin;
const defaultApiUrl = URL_CONFIG[CURRENT_ENV].apiUrl;

/** Backend root origin (Local or Railway live) */
export const BACKEND_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, ""),
  defaultOrigin
);

export const BACKEND_ORIGIN = BACKEND_URL;

/** Full backend API base: {BACKEND_URL}/api/v1 */
export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL,
  `${BACKEND_URL}/api/v1`
);

// 🔍 Console Log Indicator (Browser Console / Terminal me dikhega)
if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
  console.log(
    `%c[TradeNexa Admin] 🌐 Active ENV: %c${CURRENT_ENV.toUpperCase()}%c | API: %c${API_BASE_URL}`,
    "color: #888; font-weight: bold;",
    `color: ${IS_LIVE ? "#10b981" : "#f59e0b"}; font-weight: bold;`,
    "color: #888;",
    "color: #3b82f6; font-weight: bold;"
  );
}


export const API_ENDPOINTS = {
  auth: {
    login: "/admin/auth/login",
    logout: "/auth/logout",
    profile: "/auth/profile",
    me: "/admin/auth/me",
    refresh: "/auth/refresh-token",
    forgotPassword: "/admin/auth/forgot-password",
  },
  categories: {
    list: "/categories",
    detail: (id: number | string) => `/categories/${id}`,
    subcategories: (id: number | string) => `/categories/${id}/subcategories`,
    subcategory: (categoryId: number | string, subId: number | string) =>
      `/categories/${categoryId}/subcategories/${subId}`,
  },
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
  banners: {
    list: "/banners",
    detail: (id: number | string) => `/banners/${id}`,
  },
  brands: {
    list: "/brands",
    detail: (id: number | string) => `/brands/${id}`,
  },
  offers: {
    list: "/offers",
    detail: (id: number | string) => `/offers/${id}`,
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
  },
  sellers: {
    list: "/sellers",
    detail: (id: string) => `/sellers/${id}`,
  },
  buyers: {
    list: "/buyers",
    detail: (id: string) => `/buyers/${id}`,
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
  },
  support: {
    tickets: "/support/tickets",
    ticket: (id: string) => `/support/tickets/${id}`,
  },
  dashboard: {
    admin: "/dashboard/admin",
  },
  reports: {
    overview: "/reports/overview",
  },
  settings: {
    general: "/settings/general",
  },
} as const;
