export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tradenexabackend-production.up.railway.app/api/v1";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
  },
  categories: {
    list: "/categories",
    detail: (id: number | string) => `/categories/${id}`,
    subcategories: (id: number | string) => `/categories/${id}/subcategories`,
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
