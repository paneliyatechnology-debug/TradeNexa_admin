/** Shared chart point shapes — matches live GET /dashboard/admin payload. */

export interface ChartCategoryPoint {
  label: string;
  value: number;
}

export interface ChartDailyPoint {
  date: string;
  count: number;
}

export interface ChartMonthlyPoint {
  month: string;
  year: number;
  count: number;
}

export interface ChartDealsMonthlyPoint {
  month: string;
  year: number;
  count: number;
  rfqs_awarded: number;
  inquiries_accepted: number;
}

export interface ChartPeriodMeta {
  daily_days: number;
  monthly_months: number;
}

export interface AdminDashboardSummary {
  users_total: number;
  users_buyers: number;
  users_sellers: number;
  users_active: number;
  products_total: number;
  products_in_review: number;
  products_moderation_queue: number;
  products_approved: number;
  rfqs_total: number;
  rfqs_open: number;
  rfqs_awarded: number;
  inquiries_total: number;
  inquiries_pending: number;
  quotations_total: number;
  quotations_pending: number;
  chat_conversations: number;
  chat_unread_total: number;
}

export interface AdminDashboardUsers {
  total: number;
  buyers: number;
  sellers: number;
  buyer_seller: number;
  admins: number;
  active: number;
  verified: number;
  completed_profile: number;
  by_role: Record<string, number>;
}

export interface AdminDashboardProducts {
  total: number;
  in_review: number;
  revision_required: number;
  approved: number;
  rejected: number;
  active_approved: number;
  moderation_queue: number;
  by_approval_status: Record<string, number>;
}

export interface AdminDashboardRfqs {
  total: number;
  draft: number;
  open: number;
  awarded: number;
  completed: number;
  cancelled: number;
  expired: number;
  closed: number;
  average_quotations_per_rfq: number;
  average_response_time_minutes: number;
  by_status: Record<string, number>;
}

export interface AdminDashboardInquiries {
  total: number;
  pending: number;
  quoted: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  closed: number;
  by_status: Record<string, number>;
}

export interface AdminDashboardQuotations {
  total: number;
  pending_review: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  by_status: Record<string, number>;
}

export interface AdminDashboardChat {
  conversations: number;
  messages: number;
  unread_total: number;
}

/**
 * Charts block from live admin dashboard API.
 * Category series omit zero buckets; daily/monthly series are zero-filled.
 */
export interface AdminDashboardCharts {
  period: ChartPeriodMeta;
  users_registered_daily: ChartDailyPoint[];
  rfqs_created_daily: ChartDailyPoint[];
  inquiries_created_daily: ChartDailyPoint[];
  quotations_created_daily: ChartDailyPoint[];
  products_submitted_daily: ChartDailyPoint[];
  users_registered_monthly: ChartMonthlyPoint[];
  rfqs_created_monthly: ChartMonthlyPoint[];
  inquiries_created_monthly: ChartMonthlyPoint[];
  quotations_created_monthly: ChartMonthlyPoint[];
  products_submitted_monthly: ChartMonthlyPoint[];
  products_approved_monthly: ChartMonthlyPoint[];
  deals_won_monthly: ChartDealsMonthlyPoint[];
  users_by_role: ChartCategoryPoint[];
  products_by_approval: ChartCategoryPoint[];
  rfqs_by_status: ChartCategoryPoint[];
  inquiries_by_status: ChartCategoryPoint[];
  quotations_by_status: ChartCategoryPoint[];
  rfqs_lifecycle: ChartCategoryPoint[];
  moderation_pipeline: ChartCategoryPoint[];
}

/** GET /dashboard/admin — `data` object inside the standard envelope. */
export interface AdminDashboardData {
  role: string;
  summary: AdminDashboardSummary;
  users: AdminDashboardUsers;
  products: AdminDashboardProducts;
  rfqs: AdminDashboardRfqs;
  inquiries: AdminDashboardInquiries;
  quotations: AdminDashboardQuotations;
  chat: AdminDashboardChat;
  charts: AdminDashboardCharts;
}

/** Raw API payload before normalization (partial charts allowed). */
export type AdminDashboardApiResponse = {
  role?: string;
  summary?: Partial<AdminDashboardSummary> | null;
  users?: Partial<AdminDashboardUsers> | null;
  products?: Partial<AdminDashboardProducts> | null;
  rfqs?: Partial<AdminDashboardRfqs> | null;
  inquiries?: Partial<AdminDashboardInquiries> | null;
  quotations?: Partial<AdminDashboardQuotations> | null;
  chat?: Partial<AdminDashboardChat> | null;
  charts?: Partial<AdminDashboardCharts> | null;
};
