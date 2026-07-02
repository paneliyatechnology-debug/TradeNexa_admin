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

/** Full API base used by server proxy routes: {BACKEND_URL}/api/v1 */
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

/** Same-origin proxy paths — use in browser-side services to avoid CORS. */
export const CLIENT_API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    profile: "/api/auth/profile",
    refresh: "/api/auth/refresh-token",
  },
  categories: {
    list: "/api/categories",
    detail: (id: number | string) => `/api/categories/${id}`,
    subcategories: (id: number | string) => `/api/categories/${id}/subcategories`,
    subcategory: (categoryId: number | string, subId: number | string) =>
      `/api/categories/${categoryId}/subcategories/${subId}`,
  },
  products: {
    list: "/api/products",
    detail: (id: number | string) => `/api/products/${id}`,
  },
  users: {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
  },
  sellers: {
    list: "/api/sellers",
    detail: (id: string) => `/api/sellers/${id}`,
  },
  buyers: {
    list: "/api/buyers",
    detail: (id: string) => `/api/buyers/${id}`,
  },
  orders: {
    list: "/api/orders",
    detail: (id: string) => `/api/orders/${id}`,
  },
  support: {
    tickets: "/api/support/tickets",
    ticket: (id: string) => `/api/support/tickets/${id}`,
  },
  reports: {
    overview: "/api/reports/overview",
  },
  settings: {
    general: "/api/settings/general",
  },
} as const;
