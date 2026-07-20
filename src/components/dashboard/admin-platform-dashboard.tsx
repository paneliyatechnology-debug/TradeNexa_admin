"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { dashboardService } from "@/services/dashboard.service";
import type { AdminDashboardData } from "@/types/dashboard";
import { ArrowRight, PackageCheck, RefreshCw } from "lucide-react";

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

function ChartBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {hint ? (
          <p className="text-[12px] text-muted-foreground">{hint}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Focused admin ops dashboard (~60% of API surface).
 * Kept: actionable KPIs, moderation CTA, distribution charts, key trends.
 * Dropped: duplicate breakdown grids, overlapping status pies, excess daily/monthly series.
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
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
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

  const { summary, products, rfqs, inquiries, quotations, chat, charts } = data;

  const kpiCards = [
    {
      title: "Users",
      value: formatCount(summary.users_total),
      change: `${formatCount(summary.users_buyers)} buyers · ${formatCount(summary.users_sellers)} sellers`,
      icon: "users",
    },
    {
      title: "Moderation queue",
      value: formatCount(summary.products_moderation_queue),
      change: `${formatCount(summary.products_in_review)} in review`,
      trend:
        summary.products_moderation_queue > 0
          ? ("up" as const)
          : ("neutral" as const),
      icon: "clock",
    },
    {
      title: "Products",
      value: formatCount(summary.products_approved),
      change: `${formatCount(summary.products_total)} total · ${formatCount(products.active_approved)} live`,
      icon: "package",
    },
    {
      title: "Open RFQs",
      value: formatCount(summary.rfqs_open),
      change: `${formatCount(summary.rfqs_awarded)} awarded · ${formatCount(summary.rfqs_total)} total`,
      icon: "activity",
    },
    {
      title: "Pending inquiries",
      value: formatCount(summary.inquiries_pending),
      change: `${formatCount(summary.inquiries_total)} total`,
      icon: "message-square",
    },
    {
      title: "Pending quotations",
      value: formatCount(summary.quotations_pending),
      change: `${formatCount(quotations.accepted)} accepted · ${formatCount(summary.quotations_total)} total`,
      icon: "send",
    },
    {
      title: "Chat unread",
      value: formatCount(summary.chat_unread_total),
      change: `${formatCount(summary.chat_conversations)} threads · ${formatCount(chat.messages)} messages`,
      icon: "message-circle",
    },
    {
      title: "Avg RFQ response",
      value: formatMinutes(rfqs.average_response_time_minutes),
      change: `${formatCount(rfqs.average_quotations_per_rfq)} quotes / RFQ`,
      icon: "activity",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {description}
            <span className="text-muted-foreground/80">
              {" "}
              · Last {charts.period.daily_days}d / {charts.period.monthly_months}
              m
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={() => void load(true)}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {showProductApprovalLink ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-sm font-medium">Product moderation</p>
              <p className="text-[13px] text-muted-foreground">
                {formatCount(summary.products_moderation_queue)} listings need
                attention
                {inquiries.pending > 0
                  ? ` · ${formatCount(inquiries.pending)} inquiries pending`
                  : ""}
              </p>
            </div>
            <Link
              href={`${basePath}/product-approval`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-accent"
            >
              <PackageCheck className="h-4 w-4 text-primary" />
              Open queue
              {summary.products_moderation_queue > 0 ? (
                <Badge variant="warning">
                  {formatCount(summary.products_moderation_queue)}
                </Badge>
              ) : null}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartBlock title="Users by role">
          <CategoryPieChart data={charts.users_by_role} />
        </ChartBlock>
        <ChartBlock title="Product moderation">
          <CategoryPieChart data={charts.products_by_approval} />
        </ChartBlock>
        <ChartBlock title="RFQ lifecycle">
          <CategoryBarChart data={charts.rfqs_lifecycle} />
        </ChartBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBlock
          title="User growth"
          hint={`Last ${charts.period.daily_days} days`}
        >
          <DailyAreaChart data={charts.users_registered_daily} />
        </ChartBlock>
        <ChartBlock
          title="Deals won"
          hint="Awarded RFQs + accepted inquiries · 6 months"
        >
          <DealsStackedBarChart data={charts.deals_won_monthly} />
        </ChartBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBlock title="RFQs created · daily">
          <DailyAreaChart data={charts.rfqs_created_daily} color="#1d6b8a" />
        </ChartBlock>
        <ChartBlock title="Products submitted · daily">
          <DailyAreaChart
            data={charts.products_submitted_daily}
            color="#b45309"
          />
        </ChartBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBlock title="RFQs created · monthly">
          <MonthlyBarChart data={charts.rfqs_created_monthly} />
        </ChartBlock>
        <ChartBlock title="Users registered · monthly">
          <MonthlyBarChart data={charts.users_registered_monthly} />
        </ChartBlock>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <AdminPlatformDashboard title="Admin Dashboard" basePath="/admin" />
  );
}
