"use client";

import { Badge } from "@/components/ui/badge";
import type {
  ProductApprovalStatus,
  ProductDetail,
  ProductReviewHistoryEntry,
} from "@/types/product";
import { PRODUCT_APPROVAL_STATUS_OPTIONS } from "@/types/product";
import { cn } from "@/utils/cn";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

const EMPTY = "—";

function formatMoney(
  price: number | null | undefined,
  currency: string
): string | null {
  const amount = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(amount)) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || ""} ${amount}`.trim();
  }
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function approvalBadgeVariant(
  status: ProductApprovalStatus | null | undefined
): "info" | "warning" | "success" | "danger" | "outline" {
  switch (status) {
    case "in_review":
      return "info";
    case "revision_required":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "outline";
  }
}

function approvalLabel(status: ProductApprovalStatus | null | undefined): string {
  if (!status) return "Unknown";
  return (
    PRODUCT_APPROVAL_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status.replace(/_/g, " ")
  );
}

function reviewActionLabel(action: ProductReviewHistoryEntry["action"]): string {
  switch (action) {
    case "submitted":
      return "Submitted";
    case "resubmitted":
      return "Resubmitted";
    case "approved":
      return "Approved";
    case "revision_required":
      return "Revision requested";
    case "rejected":
      return "Rejected";
    default:
      return String(action).replace(/_/g, " ");
  }
}

function timelineDotClass(action: ProductReviewHistoryEntry["action"]): string {
  switch (action) {
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-destructive";
    case "revision_required":
      return "bg-warning";
    case "resubmitted":
      return "bg-info";
    default:
      return "bg-muted-foreground";
  }
}

function actorLabel(role: string | null | undefined): string | null {
  if (!role) return null;
  return role.replace(/_/g, " ");
}

function text(value: string | number | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function yesNo(value: boolean | null | undefined): string | null {
  if (value == null) return null;
  return value ? "Yes" : "No";
}

function SectionTitle({
  children,
  count,
}: {
  children: ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </p>
      {typeof count === "number" ? (
        <span className="font-data text-[11px] text-muted-foreground/70">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2">
      <dt className="shrink-0 text-[12px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-right text-[13px] font-medium",
          value ? "text-foreground" : "text-muted-foreground/60"
        )}
      >
        {value ?? EMPTY}
      </dd>
    </div>
  );
}

function DetailThumb({
  thumbnail,
  name,
}: {
  thumbnail: string | null;
  name: string;
}) {
  const src = resolveMediaDisplayUrl(thumbnail);

  if (!src) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
        <ImageIcon className="h-6 w-6" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function specificationEntries(
  specs: Record<string, unknown> | null | undefined
): { key: string; value: string }[] {
  if (!specs || typeof specs !== "object") return [];
  return Object.entries(specs)
    .map(([key, raw]) => {
      if (raw == null) return null;
      if (
        typeof raw === "string" ||
        typeof raw === "number" ||
        typeof raw === "boolean"
      ) {
        const value = String(raw).trim();
        return value ? { key, value } : null;
      }
      try {
        const value = JSON.stringify(raw);
        return value && value !== "{}" && value !== "[]" ? { key, value } : null;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is { key: string; value: string } => entry != null);
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface ProductDetailPanelProps {
  detail: ProductDetail;
  history: ProductReviewHistoryEntry[];
}

export function ProductDetailPanel({
  detail,
  history,
}: ProductDetailPanelProps) {
  const seller = text(detail.seller_name) ?? text(detail.supplier_name);
  const location =
    [text(detail.city), text(detail.state)].filter(Boolean).join(", ") || null;
  const price = formatMoney(detail.price, detail.currency);
  const moq =
    detail.moq != null && Number.isFinite(Number(detail.moq))
      ? `${detail.moq}${text(detail.unit) ? ` ${detail.unit}` : ""}`
      : null;
  const stock =
    [
      detail.stock_quantity != null && Number.isFinite(detail.stock_quantity)
        ? String(detail.stock_quantity)
        : null,
      text(detail.stock_status),
    ]
      .filter(Boolean)
      .join(" · ") || null;
  const gst =
    detail.gst_percentage != null && Number.isFinite(detail.gst_percentage)
      ? `${detail.gst_percentage}%`
      : null;

  const specs = specificationEntries(detail.specifications);
  const tags = (detail.search_tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean);

  const headlineStats = [
    { label: "Price", value: price },
    { label: "MOQ", value: moq },
    { label: "Stock", value: stock },
    { label: "GST", value: gst },
  ];

  const catalogFields = [
    { label: "Category", value: text(detail.category_name) },
    { label: "Subcategory", value: text(detail.subcategory_name) },
    { label: "Brand", value: text(detail.brand_name) },
    { label: "Location", value: location },
    { label: "Country of origin", value: text(detail.country_of_origin) },
    { label: "Material", value: text(detail.material) },
    { label: "Condition", value: text(detail.product_condition) },
    { label: "Warranty", value: text(detail.warranty) },
    { label: "HSN code", value: text(detail.hsn_code) },
    { label: "Product ID", value: text(detail.id) },
  ];

  const flagFields = [
    { label: "Active", value: yesNo(detail.is_active) },
    { label: "Show price", value: yesNo(detail.show_price) },
    { label: "Accept inquiry", value: yesNo(detail.accept_inquiry) },
    { label: "Trending", value: yesNo(detail.is_trending) },
  ].filter((field) => field.value != null);

  const timestampFields = [
    { label: "Submitted", value: formatDateTime(detail.submitted_at) },
    { label: "Resubmitted", value: formatDateTime(detail.resubmitted_at) },
    { label: "Reviewed", value: formatDateTime(detail.reviewed_at) },
  ].filter((field) => field.value != null);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <DetailThumb thumbnail={detail.thumbnail} name={detail.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={approvalBadgeVariant(detail.approval_status)}>
                {approvalLabel(detail.approval_status)}
              </Badge>
              {detail.review_version != null ? (
                <span className="rounded-sm border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Review v{detail.review_version}
                </span>
              ) : null}
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-foreground">
              {detail.name}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Seller:{" "}
              <span className="text-foreground">{seller ?? EMPTY}</span>
            </p>
            {text(detail.slug) ? (
              <p className="mt-1 truncate font-data text-[11px] text-muted-foreground/80">
                /{detail.slug}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {headlineStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-border bg-card px-3 py-2"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 truncate font-data text-sm font-semibold",
                  stat.value ? "text-foreground" : "text-muted-foreground/60"
                )}
              >
                {stat.value ?? EMPTY}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Left: listing data */}
        <div className="space-y-5 lg:col-span-3">
          <section>
            <SectionTitle>Listing details</SectionTitle>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {catalogFields.map((field) => (
                <FieldRow
                  key={field.label}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </dl>
          </section>

          {flagFields.length > 0 ? (
            <section>
              <SectionTitle>Visibility</SectionTitle>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {flagFields.map((field) => (
                  <FieldRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </dl>
            </section>
          ) : null}

          {specs.length > 0 ? (
            <section>
              <SectionTitle count={specs.length}>Specifications</SectionTitle>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {specs.map((entry) => (
                  <FieldRow
                    key={entry.key}
                    label={humanizeKey(entry.key)}
                    value={entry.value}
                  />
                ))}
              </dl>
            </section>
          ) : null}

          {text(detail.short_description) || text(detail.description) ? (
            <section className="space-y-3">
              <SectionTitle>Description</SectionTitle>
              {text(detail.short_description) ? (
                <p className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-[13px] leading-relaxed text-foreground">
                  {detail.short_description}
                </p>
              ) : null}
              {text(detail.description) ? (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                  {detail.description}
                </p>
              ) : null}
            </section>
          ) : null}

          {tags.length > 0 ? (
            <section>
              <SectionTitle count={tags.length}>Search tags</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right: moderation trail */}
        <div className="space-y-5 lg:col-span-2">
          {text(detail.latest_review_remarks) ? (
            <section>
              <SectionTitle>Latest remarks</SectionTitle>
              <div className="rounded-md border-l-2 border-l-primary border-y border-r border-border bg-accent/40 px-3 py-2.5">
                <p className="text-[13px] leading-relaxed text-foreground">
                  {detail.latest_review_remarks}
                </p>
              </div>
            </section>
          ) : null}

          {timestampFields.length > 0 ? (
            <section>
              <SectionTitle>Timestamps</SectionTitle>
              <dl className="grid grid-cols-1 gap-2">
                {timestampFields.map((field) => (
                  <FieldRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </dl>
            </section>
          ) : null}

          <section>
            <SectionTitle count={history.length || undefined}>
              Review history
            </SectionTitle>
            {history.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted-foreground">
                No review events yet.
              </p>
            ) : (
              <ol className="relative space-y-3">
                {history.map((entry, index) => {
                  const isLast = index === history.length - 1;
                  return (
                    <li key={entry.id} className="relative pl-4">
                      {!isLast ? (
                        <span
                          className="absolute left-[3px] top-3 bottom-[-0.75rem] w-px bg-border"
                          aria-hidden
                        />
                      ) : null}
                      <span
                        className={cn(
                          "absolute left-0 top-1.5 z-[1] h-2 w-2 rounded-full ring-2 ring-card",
                          timelineDotClass(entry.action)
                        )}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <p className="text-[13px] font-semibold text-foreground">
                          {reviewActionLabel(entry.action)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDateTime(entry.created_at) ?? EMPTY}
                        </p>
                      </div>
                      {entry.from_status && entry.to_status ? (
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {approvalLabel(entry.from_status)} →{" "}
                          {approvalLabel(entry.to_status)}
                        </p>
                      ) : null}
                      {text(entry.remarks) ? (
                        <p className="mt-1 rounded-md bg-secondary/60 px-2.5 py-1.5 text-[12px] leading-relaxed text-foreground">
                          {entry.remarks}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        v{entry.review_version}
                        {actorLabel(entry.actor_role)
                          ? ` · ${actorLabel(entry.actor_role)}`
                          : ""}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
