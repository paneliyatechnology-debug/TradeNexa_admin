"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CategoryBarChart,
  CategoryPieChart,
  DailyAreaChart,
  DealsStackedBarChart,
  MonthlyBarChart,
} from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/services/dashboard.service";
import type { AdminDashboardData } from "@/types/dashboard";
import { cn } from "@/utils/cn";
import {
  Activity,
  ArrowRight,
  Clock,
  MessageCircle,
  MessageSquare,
  Package,
  PackageCheck,
  RefreshCw,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";

interface AdminPlatformDashboardProps {
  title: string;
  description?: string;
  basePath: string;
  showProductApprovalLink?: boolean;
}

function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatMinutes(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value < 60) return `${Math.round(value)} min`;
  const hours = value / 60;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)} hr`;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

function KpiTile({
  title,
  value,
  meta,
  icon: Icon,
  emphasize,
}: {
  title: string;
  value: string;
  meta: string;
  icon: LucideIcon;
  emphasize?: boolean;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors duration-150",
        emphasize
          ? "border-warning/30 bg-warning/[0.04]"
          : "hover:border-primary/25"
      )}
    >
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-[12px] font-medium text-muted-foreground">
              {title}
            </p>
            <p className="font-data text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="truncate text-[11px] leading-snug text-muted-foreground">
              {meta}
            </p>
          </div>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              emphasize
                ? "bg-warning/15 text-warning"
                : "bg-accent text-primary"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </div>
        {emphasize ? (
          <span
            className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-warning"
            aria-hidden
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function ChartPanel({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
      <div className="px-3 py-3 sm:px-4 sm:py-4">{children}</div>
    </Card>
  );
}

/**
 * Focused admin ops dashboard — same API surface, denser visual hierarchy.
 */
export function AdminPlatformDashboard({
  title,
  description = "Platform health, moderation, and marketplace activity.",
  basePath,
  showProductApprovalLink = true,
}: AdminPlatformDashboardProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const dashboard = await dashboardService.getAdminDashboard();
      setData(dashboard);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-muted-foreground">
              Could not load dashboard data.
            </p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, products, rfqs, quotations, chat, charts } = data;
  const queueCount = summary.products_moderation_queue;

  const kpis = [
    {
      title: "Users",
      value: formatCount(summary.users_total),
      meta: `${formatCount(summary.users_buyers)} buyers · ${formatCount(summary.users_sellers)} sellers`,
      icon: Users,
    },
    {
      title: "Moderation queue",
      value: formatCount(queueCount),
      meta: `${formatCount(summary.products_in_review)} in review`,
      icon: Clock,
      emphasize: queueCount > 0,
    },
    {
      title: "Products",
      value: formatCount(summary.products_approved),
      meta: `${formatCount(summary.products_total)} total · ${formatCount(products.active_approved)} live`,
      icon: Package,
    },
    {
      title: "Open RFQs",
      value: formatCount(summary.rfqs_open),
      meta: `${formatCount(summary.rfqs_awarded)} awarded · ${formatCount(summary.rfqs_total)} total`,
      icon: Activity,
    },
    {
      title: "Pending inquiries",
      value: formatCount(summary.inquiries_pending),
      meta: `${formatCount(summary.inquiries_total)} total`,
      icon: MessageSquare,
    },
    {
      title: "Pending quotations",
      value: formatCount(summary.quotations_pending),
      meta: `${formatCount(quotations.accepted)} accepted · ${formatCount(summary.quotations_total)} total`,
      icon: Send,
    },
    {
      title: "Chat unread",
      value: formatCount(summary.chat_unread_total),
      meta: `${formatCount(summary.chat_conversations)} threads · ${formatCount(chat.messages)} messages`,
      icon: MessageCircle,
    },
    {
      title: "Avg RFQ response",
      value: formatMinutes(rfqs.average_response_time_minutes),
      meta: `${formatCount(rfqs.average_quotations_per_rfq)} quotes / RFQ`,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-7">
      {/* Page header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            {description}
            <span className="text-muted-foreground/70">
              {" "}
              · Window {charts.period.daily_days}d /{" "}
              {charts.period.monthly_months}m
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={() => void load(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI strip */}
      <section>
        <SectionLabel>Key metrics</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiTile key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      {/* Moderation CTA */}
      {showProductApprovalLink ? (
        <section>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-accent/80 via-card to-card">
            <CardContent className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <span
                className="absolute inset-y-0 left-0 w-1 bg-primary"
                aria-hidden
              />
              <div className="flex min-w-0 items-start gap-3 pl-2 sm:pl-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PackageCheck className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Product moderation
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {formatCount(queueCount)} listing
                    {queueCount === 1 ? "" : "s"} need attention before going
                    live
                  </p>
                </div>
              </div>
              <Link
                href={`${basePath}/product-approval`}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium",
                  "bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                Open queue
                {queueCount > 0 ? (
                  <Badge className="border-0 bg-primary-foreground/20 text-primary-foreground">
                    {formatCount(queueCount)}
                  </Badge>
                ) : null}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {/* Distribution */}
      <section>
        <SectionLabel>Distribution</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChartPanel title="Users by role">
            <CategoryPieChart data={charts.users_by_role} />
          </ChartPanel>
          <ChartPanel title="Product moderation">
            <CategoryPieChart data={charts.products_by_approval} />
          </ChartPanel>
          <ChartPanel
            title="RFQ lifecycle"
            className="md:col-span-2 xl:col-span-1"
          >
            <CategoryBarChart data={charts.rfqs_lifecycle} />
          </ChartPanel>
        </div>
      </section>

      {/* Trends */}
      <section>
        <SectionLabel>Trends</SectionLabel>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title="User growth"
            hint={`Registrations · last ${charts.period.daily_days} days`}
          >
            <DailyAreaChart data={charts.users_registered_daily} />
          </ChartPanel>
          <ChartPanel
            title="Deals won"
            hint="Awarded RFQs + accepted inquiries · 6 months"
          >
            <DealsStackedBarChart data={charts.deals_won_monthly} />
          </ChartPanel>
          <ChartPanel title="RFQs created · daily">
            <DailyAreaChart data={charts.rfqs_created_daily} color="#1d6b8a" />
          </ChartPanel>
          <ChartPanel title="Products submitted · daily">
            <DailyAreaChart
              data={charts.products_submitted_daily}
              color="#b45309"
            />
          </ChartPanel>
          <ChartPanel title="RFQs created · monthly">
            <MonthlyBarChart data={charts.rfqs_created_monthly} />
          </ChartPanel>
          <ChartPanel title="Users registered · monthly">
            <MonthlyBarChart data={charts.users_registered_monthly} />
          </ChartPanel>
        </div>
      </section>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <AdminPlatformDashboard title="Admin Dashboard" basePath="/admin" />
  );
}
