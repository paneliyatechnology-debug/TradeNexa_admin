import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type {
  AdminDashboardApiResponse,
  AdminDashboardCharts,
  AdminDashboardChat,
  AdminDashboardData,
  AdminDashboardInquiries,
  AdminDashboardProducts,
  AdminDashboardQuotations,
  AdminDashboardRfqs,
  AdminDashboardSummary,
  AdminDashboardUsers,
  ChartCategoryPoint,
  ChartDailyPoint,
  ChartDealsMonthlyPoint,
  ChartMonthlyPoint,
} from "@/types/dashboard";
import { apiClientGet } from "@/utils/api-client";

const ADMIN_DASHBOARD_URL = `${API_BASE_URL}${API_ENDPOINTS.dashboard.admin}`;

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    out[key] = asNumber(raw);
  }
  return out;
}

function asCategorySeries(value: unknown): ChartCategoryPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = String(row.label ?? "").trim();
      if (!label) return null;
      return { label, value: asNumber(row.value) };
    })
    .filter((item): item is ChartCategoryPoint => item != null);
}

function asDailySeries(value: unknown): ChartDailyPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const date = String(row.date ?? "").trim();
      if (!date) return null;
      return { date, count: asNumber(row.count) };
    })
    .filter((item): item is ChartDailyPoint => item != null);
}

function asMonthlySeries(value: unknown): ChartMonthlyPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const month = String(row.month ?? "").trim();
      if (!month) return null;
      return {
        month,
        year: asNumber(row.year),
        count: asNumber(row.count),
      };
    })
    .filter((item): item is ChartMonthlyPoint => item != null);
}

function asDealsMonthlySeries(value: unknown): ChartDealsMonthlyPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const month = String(row.month ?? "").trim();
      if (!month) return null;
      return {
        month,
        year: asNumber(row.year),
        count: asNumber(row.count),
        rfqs_awarded: asNumber(row.rfqs_awarded),
        inquiries_accepted: asNumber(row.inquiries_accepted),
      };
    })
    .filter((item): item is ChartDealsMonthlyPoint => item != null);
}

function normalizeSummary(
  raw: Partial<AdminDashboardSummary> | null | undefined
): AdminDashboardSummary {
  return {
    users_total: asNumber(raw?.users_total),
    users_buyers: asNumber(raw?.users_buyers),
    users_sellers: asNumber(raw?.users_sellers),
    users_active: asNumber(raw?.users_active),
    products_total: asNumber(raw?.products_total),
    products_in_review: asNumber(raw?.products_in_review),
    products_moderation_queue: asNumber(raw?.products_moderation_queue),
    products_approved: asNumber(raw?.products_approved),
    rfqs_total: asNumber(raw?.rfqs_total),
    rfqs_open: asNumber(raw?.rfqs_open),
    rfqs_awarded: asNumber(raw?.rfqs_awarded),
    inquiries_total: asNumber(raw?.inquiries_total),
    inquiries_pending: asNumber(raw?.inquiries_pending),
    quotations_total: asNumber(raw?.quotations_total),
    quotations_pending: asNumber(raw?.quotations_pending),
    chat_conversations: asNumber(raw?.chat_conversations),
    chat_unread_total: asNumber(raw?.chat_unread_total),
  };
}

function normalizeUsers(
  raw: Partial<AdminDashboardUsers> | null | undefined
): AdminDashboardUsers {
  return {
    total: asNumber(raw?.total),
    buyers: asNumber(raw?.buyers),
    sellers: asNumber(raw?.sellers),
    buyer_seller: asNumber(raw?.buyer_seller),
    admins: asNumber(raw?.admins),
    active: asNumber(raw?.active),
    verified: asNumber(raw?.verified),
    completed_profile: asNumber(raw?.completed_profile),
    by_role: asRecord(raw?.by_role),
  };
}

function normalizeProducts(
  raw: Partial<AdminDashboardProducts> | null | undefined
): AdminDashboardProducts {
  return {
    total: asNumber(raw?.total),
    in_review: asNumber(raw?.in_review),
    revision_required: asNumber(raw?.revision_required),
    approved: asNumber(raw?.approved),
    rejected: asNumber(raw?.rejected),
    active_approved: asNumber(raw?.active_approved),
    moderation_queue: asNumber(raw?.moderation_queue),
    by_approval_status: asRecord(raw?.by_approval_status),
  };
}

function normalizeRfqs(
  raw: Partial<AdminDashboardRfqs> | null | undefined
): AdminDashboardRfqs {
  return {
    total: asNumber(raw?.total),
    draft: asNumber(raw?.draft),
    open: asNumber(raw?.open),
    awarded: asNumber(raw?.awarded),
    completed: asNumber(raw?.completed),
    cancelled: asNumber(raw?.cancelled),
    expired: asNumber(raw?.expired),
    closed: asNumber(raw?.closed),
    average_quotations_per_rfq: asNumber(raw?.average_quotations_per_rfq),
    average_response_time_minutes: asNumber(raw?.average_response_time_minutes),
    by_status: asRecord(raw?.by_status),
  };
}

function normalizeInquiries(
  raw: Partial<AdminDashboardInquiries> | null | undefined
): AdminDashboardInquiries {
  return {
    total: asNumber(raw?.total),
    pending: asNumber(raw?.pending),
    quoted: asNumber(raw?.quoted),
    accepted: asNumber(raw?.accepted),
    rejected: asNumber(raw?.rejected),
    cancelled: asNumber(raw?.cancelled),
    closed: asNumber(raw?.closed),
    by_status: asRecord(raw?.by_status),
  };
}

function normalizeQuotations(
  raw: Partial<AdminDashboardQuotations> | null | undefined
): AdminDashboardQuotations {
  return {
    total: asNumber(raw?.total),
    pending_review: asNumber(raw?.pending_review),
    accepted: asNumber(raw?.accepted),
    rejected: asNumber(raw?.rejected),
    withdrawn: asNumber(raw?.withdrawn),
    by_status: asRecord(raw?.by_status),
  };
}

function normalizeChat(
  raw: Partial<AdminDashboardChat> | null | undefined
): AdminDashboardChat {
  return {
    conversations: asNumber(raw?.conversations),
    messages: asNumber(raw?.messages),
    unread_total: asNumber(raw?.unread_total),
  };
}

function normalizeCharts(
  raw: Partial<AdminDashboardCharts> | null | undefined
): AdminDashboardCharts {
  return {
    period: {
      daily_days: asNumber(raw?.period?.daily_days, 30),
      monthly_months: asNumber(raw?.period?.monthly_months, 6),
    },
    users_registered_daily: asDailySeries(raw?.users_registered_daily),
    rfqs_created_daily: asDailySeries(raw?.rfqs_created_daily),
    inquiries_created_daily: asDailySeries(raw?.inquiries_created_daily),
    quotations_created_daily: asDailySeries(raw?.quotations_created_daily),
    products_submitted_daily: asDailySeries(raw?.products_submitted_daily),
    users_registered_monthly: asMonthlySeries(raw?.users_registered_monthly),
    rfqs_created_monthly: asMonthlySeries(raw?.rfqs_created_monthly),
    inquiries_created_monthly: asMonthlySeries(raw?.inquiries_created_monthly),
    quotations_created_monthly: asMonthlySeries(raw?.quotations_created_monthly),
    products_submitted_monthly: asMonthlySeries(raw?.products_submitted_monthly),
    products_approved_monthly: asMonthlySeries(raw?.products_approved_monthly),
    deals_won_monthly: asDealsMonthlySeries(raw?.deals_won_monthly),
    users_by_role: asCategorySeries(raw?.users_by_role),
    products_by_approval: asCategorySeries(raw?.products_by_approval),
    rfqs_by_status: asCategorySeries(raw?.rfqs_by_status),
    inquiries_by_status: asCategorySeries(raw?.inquiries_by_status),
    quotations_by_status: asCategorySeries(raw?.quotations_by_status),
    rfqs_lifecycle: asCategorySeries(raw?.rfqs_lifecycle),
    moderation_pipeline: asCategorySeries(raw?.moderation_pipeline),
  };
}

/** Normalize live admin dashboard `data` into a stable UI shape. */
export function normalizeAdminDashboard(
  raw: AdminDashboardApiResponse | null | undefined
): AdminDashboardData {
  return {
    role: String(raw?.role ?? "admin"),
    summary: normalizeSummary(raw?.summary),
    users: normalizeUsers(raw?.users),
    products: normalizeProducts(raw?.products),
    rfqs: normalizeRfqs(raw?.rfqs),
    inquiries: normalizeInquiries(raw?.inquiries),
    quotations: normalizeQuotations(raw?.quotations),
    chat: normalizeChat(raw?.chat),
    charts: normalizeCharts(raw?.charts),
  };
}

export const dashboardService = {
  /**
   * GET /dashboard/admin
   * Envelope: { success, message, data } — returns normalized `data`.
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const data = await apiClientGet<AdminDashboardApiResponse>(ADMIN_DASHBOARD_URL);
    return normalizeAdminDashboard(data);
  },
};
