"use client";

import { Badge } from "@/components/ui/badge";
import type {
  ProductApprovalStatus,
  ProductDetail,
  ProductReviewHistoryEntry,
} from "@/types/product";
import { PRODUCT_APPROVAL_STATUS_OPTIONS } from "@/types/product";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { ImageIcon } from "lucide-react";

function formatMoney(price: number | null | undefined, currency: string): string {
  const amount = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(amount)) return "—";
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

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function approvalBadgeVariant(
  status: ProductApprovalStatus
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "in_review":
      return "info";
    case "revision_required":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
  }
}

function approvalLabel(status: ProductApprovalStatus): string {
  return (
    PRODUCT_APPROVAL_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
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
      return "Revision required";
    case "rejected":
      return "Rejected";
    default:
      return action;
  }
}

function yesNo(value: boolean | null | undefined): string {
  if (value == null) return "—";
  return value ? "Yes" : "No";
}

function displayText(value: string | number | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground break-words">{value}</dd>
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
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted text-muted-foreground sm:h-28 sm:w-28">
        <ImageIcon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40 sm:h-28 sm:w-28">
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
      if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
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

interface ProductDetailPanelProps {
  detail: ProductDetail;
  history: ProductReviewHistoryEntry[];
}

export function ProductDetailPanel({ detail, history }: ProductDetailPanelProps) {
  const seller =
    detail.seller_name?.trim() || detail.supplier_name?.trim() || null;
  const location = [detail.city, detail.state].filter(Boolean).join(", ") || null;
  const stockParts = [
    detail.stock_quantity != null && Number.isFinite(detail.stock_quantity)
      ? String(detail.stock_quantity)
      : null,
    displayText(detail.stock_status),
  ].filter(Boolean);
  const stockLabel = stockParts.length > 0 ? stockParts.join(" · ") : null;
  const specs = specificationEntries(detail.specifications);
  const tags = (detail.search_tags ?? []).map((tag) => tag.trim()).filter(Boolean);

  const fieldGrid = [
    { label: "Category", value: displayText(detail.category_name) },
    { label: "Subcategory", value: displayText(detail.subcategory_name) },
    { label: "Brand", value: displayText(detail.brand_name) },
    { label: "Location", value: location },
    { label: "Country of origin", value: displayText(detail.country_of_origin) },
    { label: "Material", value: displayText(detail.material) },
    { label: "Condition", value: displayText(detail.product_condition) },
    { label: "Warranty", value: displayText(detail.warranty) },
    { label: "HSN code", value: displayText(detail.hsn_code) },
    {
      label: "GST",
      value:
        detail.gst_percentage != null && Number.isFinite(detail.gst_percentage)
          ? `${detail.gst_percentage}%`
          : null,
    },
    { label: "Stock", value: stockLabel },
    { label: "Show price", value: yesNo(detail.show_price) },
    { label: "Accept inquiry", value: yesNo(detail.accept_inquiry) },
    { label: "Trending", value: yesNo(detail.is_trending) },
    { label: "Active", value: yesNo(detail.is_active) },
    { label: "Submitted", value: formatDateTime(detail.submitted_at) },
    {
      label: "Resubmitted",
      value: detail.resubmitted_at ? formatDateTime(detail.resubmitted_at) : null,
    },
    {
      label: "Reviewed",
      value: detail.reviewed_at ? formatDateTime(detail.reviewed_at) : null,
    },
  ].filter((field) => field.value && field.value !== "—");

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <DetailThumb thumbnail={detail.thumbnail} name={detail.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={approvalBadgeVariant(detail.approval_status)}>
              {approvalLabel(detail.approval_status)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Review v{detail.review_version}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {formatMoney(detail.price, detail.currency)} · MOQ {detail.moq}{" "}
            {detail.unit}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seller: {seller || "—"}
          </p>
          {detail.slug ? (
            <p className="mt-1 truncate font-data text-xs text-muted-foreground">
              {detail.slug}
            </p>
          ) : null}
        </div>
      </div>

      {fieldGrid.length > 0 ? (
        <div>
          <SectionTitle>Listing details</SectionTitle>
          <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fieldGrid.map((field) => (
              <DetailField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </dl>
        </div>
      ) : null}

      {specs.length > 0 ? (
        <div>
          <SectionTitle>Specifications</SectionTitle>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {specs.map((entry) => (
              <DetailField key={entry.key} label={entry.key} value={entry.value} />
            ))}
          </dl>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div>
          <SectionTitle>Search tags</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {detail.short_description ? (
        <div>
          <SectionTitle>Short description</SectionTitle>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {detail.short_description}
          </p>
        </div>
      ) : null}

      {detail.description ? (
        <div>
          <SectionTitle>Description</SectionTitle>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {detail.description}
          </p>
        </div>
      ) : null}

      {detail.latest_review_remarks ? (
        <div className="rounded-md border border-border bg-secondary px-3 py-2.5">
          <SectionTitle>Latest remarks</SectionTitle>
          <p className="mt-1 text-sm">{detail.latest_review_remarks}</p>
        </div>
      ) : null}

      <div>
        <SectionTitle>Review history</SectionTitle>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No review events yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border border-border px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {reviewActionLabel(entry.action)}
                    {entry.from_status && entry.to_status
                      ? ` · ${approvalLabel(entry.from_status)} → ${approvalLabel(entry.to_status)}`
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </p>
                </div>
                {entry.remarks ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.remarks}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  v{entry.review_version}
                  {entry.actor_role ? ` · ${entry.actor_role}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
