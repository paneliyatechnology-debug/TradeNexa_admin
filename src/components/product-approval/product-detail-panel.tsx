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
import { useState, type ReactNode } from "react";

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

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

function MediaThumb({
  src,
  alt,
  selected,
  onClick,
  size = "lg",
}: {
  src: string | null;
  alt: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "lg" | "sm";
}) {
  const resolved = resolveMediaDisplayUrl(src);
  const box =
    size === "lg"
      ? "h-24 w-24 sm:h-28 sm:w-28"
      : "h-14 w-14";

  if (!resolved) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground",
          box
        )}
      >
        <ImageIcon className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
      </div>
    );
  }

  const image = (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-lg border bg-muted/40",
        box,
        selected ? "border-primary ring-2 ring-primary/25" : "border-border"
      )}
    >
      <img
        src={resolved}
        alt={alt}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  if (!onClick) return image;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {image}
    </button>
  );
}

function specificationEntries(
  specs: Record<string, unknown> | Array<unknown> | null | undefined
): { key: string; value: string }[] {
  if (!specs) return [];

  if (Array.isArray(specs)) {
    return specs
      .map((item, index) => {
        if (item == null) return null;
        if (typeof item === "string" || typeof item === "number") {
          const value = String(item).trim();
          return value ? { key: `Spec ${index + 1}`, value } : null;
        }
        if (typeof item === "object") {
          const row = item as Record<string, unknown>;
          const key =
            text(String(row.key ?? row.name ?? row.label ?? "")) ??
            `Spec ${index + 1}`;
          const value = text(
            String(row.value ?? row.detail ?? row.description ?? "")
          );
          return value ? { key, value } : null;
        }
        return null;
      })
      .filter((entry): entry is { key: string; value: string } => entry != null);
  }

  if (typeof specs !== "object") return [];

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
        return value && value !== "{}" && value !== "[]"
          ? { key, value }
          : null;
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

export function ProductDetailPanel({
  detail,
  history,
}: ProductDetailPanelProps) {
  const galleryUrls = (detail.gallery ?? [])
    .map((item) => item.url)
    .filter(Boolean);
  const imageOptions = [
    ...(detail.thumbnail ? [detail.thumbnail] : []),
    ...galleryUrls.filter((url) => url !== detail.thumbnail),
  ];

  const [activeImage, setActiveImage] = useState<string | null>(
    imageOptions[0] ?? null
  );

  const seller =
    text(detail.seller?.company_name) ??
    text(detail.seller_name) ??
    text(detail.supplier_name);

  const location =
    [
      text(detail.seller?.city) ?? text(detail.city),
      text(detail.seller?.state) ?? text(detail.state),
      text(detail.seller?.country),
    ]
      .filter(Boolean)
      .join(", ") || null;

  const price = formatMoney(detail.price, detail.currency);
  const moq =
    detail.moq != null && Number.isFinite(Number(detail.moq)) && detail.moq > 0
      ? `${detail.moq}${text(detail.unit) ? ` ${detail.unit}` : ""}`
      : null;
  const stock =
    [
      detail.stock_quantity != null && Number.isFinite(detail.stock_quantity)
        ? String(detail.stock_quantity)
        : null,
      text(detail.stock_status)
        ? humanizeKey(String(detail.stock_status))
        : null,
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
    { label: "Brand country", value: text(detail.brand_country) },
    { label: "Location", value: location },
    {
      label: "Address",
      value: [
        text(detail.seller?.address_line_1),
        text(detail.seller?.pincode),
      ]
        .filter(Boolean)
        .join(", ") || null,
    },
    { label: "Country of origin", value: text(detail.country_of_origin) },
    { label: "Material", value: text(detail.material) },
    {
      label: "Condition",
      value: text(detail.product_condition)
        ? humanizeKey(String(detail.product_condition))
        : null,
    },
    { label: "Warranty", value: text(detail.warranty) },
    { label: "HSN code", value: text(detail.hsn_code) },
    { label: "Product ID", value: text(detail.id) },
  ];

  const sellerFields = [
    { label: "Company", value: seller },
    { label: "Email", value: text(detail.seller?.email) },
    { label: "Phone", value: text(detail.seller?.phone) },
  ].filter((field) => field.value != null);

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
      <div className="rounded-lg border border-border bg-secondary/40 p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <MediaThumb
            src={activeImage}
            alt={detail.name}
            size="lg"
          />
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

        {imageOptions.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {imageOptions.map((url) => (
              <MediaThumb
                key={url}
                src={url}
                alt={detail.name}
                size="sm"
                selected={activeImage === url}
                onClick={() => setActiveImage(url)}
              />
            ))}
          </div>
        ) : null}

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

          {sellerFields.length > 0 ? (
            <section>
              <SectionTitle>Seller</SectionTitle>
              <div className="mb-2 flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                <MediaThumb
                  src={detail.seller?.company_logo ?? null}
                  alt={seller ?? "Seller"}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {seller ?? EMPTY}
                  </p>
                  {location ? (
                    <p className="truncate text-[12px] text-muted-foreground">
                      {location}
                    </p>
                  ) : null}
                </div>
              </div>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sellerFields.map((field) => (
                  <FieldRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </dl>
            </section>
          ) : null}

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
