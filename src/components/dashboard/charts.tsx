"use client";

import { cn } from "@/utils/cn";
import type {
  ChartCategoryPoint,
  ChartDailyPoint,
  ChartDealsMonthlyPoint,
  ChartMonthlyPoint,
} from "@/types/dashboard";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#0e7c6b",
  "#1d6b8a",
  "#b45309",
  "#1b7f5a",
  "#c23b3b",
  "#5b6b76",
  "#0b1f2a",
  "#8a9aa6",
];

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  boxShadow: "var(--shadow-sm)",
  fontSize: 12,
};

export function formatChartLabel(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function EmptyChart({ message = "No data yet" }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center rounded-md border border-dashed border-border bg-secondary/40 px-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function CategoryPieChart({
  data,
  className,
}: {
  data: ChartCategoryPoint[];
  className?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const chartData = data.map((point) => ({
    ...point,
    name: formatChartLabel(point.label),
  }));

  return (
    <div className={cn("h-56 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {chartData.map((_, index) => (
              <Cell
                key={chartData[index].label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [value.toLocaleString(), "Count"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({
  data,
  className,
}: {
  data: ChartCategoryPoint[];
  className?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const chartData = data.map((point) => ({
    ...point,
    name: formatChartLabel(point.label),
  }));

  return (
    <div className={cn("h-56 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={48}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="#0e7c6b" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyAreaChart({
  data,
  className,
  color = "#0e7c6b",
}: {
  data: ChartDailyPoint[];
  className?: string;
  color?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const chartData = data.map((point) => ({
    ...point,
    label: point.date.slice(5),
  }));

  return (
    <div className={cn("h-56 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as ChartDailyPoint | undefined)?.date ?? ""
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${color.replace("#", "")})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBarChart({
  data,
  className,
}: {
  data: ChartMonthlyPoint[];
  className?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const chartData = data.map((point) => ({
    ...point,
    label: point.month.slice(0, 3),
    fullLabel: `${point.month} ${point.year}`,
  }));

  return (
    <div className={cn("h-56 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullLabel?: string } | undefined)?.fullLabel ?? ""
            }
          />
          <Bar dataKey="count" fill="#1d6b8a" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DealsStackedBarChart({
  data,
  className,
}: {
  data: ChartDealsMonthlyPoint[];
  className?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const chartData = data.map((point) => ({
    ...point,
    label: point.month.slice(0, 3),
    fullLabel: `${point.month} ${point.year}`,
  }));

  return (
    <div className={cn("h-56 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullLabel?: string } | undefined)?.fullLabel ?? ""
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
          <Bar
            dataKey="rfqs_awarded"
            name="RFQs awarded"
            stackId="deals"
            fill="#0e7c6b"
            radius={[0, 0, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="inquiries_accepted"
            name="Inquiries accepted"
            stackId="deals"
            fill="#1d6b8a"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
