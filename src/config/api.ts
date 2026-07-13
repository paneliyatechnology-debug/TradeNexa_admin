const DEFAULT_BACKEND_URL = "https://tradenexabackend-production.up.railway.app";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Railway backend root, e.g. https://tradenexabackend-production.up.railway.app */
export const BACKEND_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ??
    DEFAULT_BACKEND_URL
);

/** Full backend API base: {BACKEND_URL}/api/v1 */
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

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
  reports: {
    overview: "/reports/overview",
  },
  settings: {
    general: "/settings/general",
  },
} as const;
