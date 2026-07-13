"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ProductDecisionDialog,
  type ProductDecisionAction,
} from "@/components/product-approval/product-decision-dialog";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { productsService } from "@/services/products.service";
import type { PaginatedData, SortOrder } from "@/types/api";
import type {
  AdminProductDecisionResult,
  AdminReviewSortBy,
  ProductApprovalStatus,
  ProductDetail,
  ProductReviewHistoryEntry,
  ProductReviewItem,
} from "@/types/product";
import { PRODUCT_APPROVAL_STATUS_OPTIONS } from "@/types/product";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { cn } from "@/utils/cn";
import { getColumnDefaultOrder, nextColumnSortState } from "@/utils/column-sort";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Eye,
  ImageIcon,
  MessageSquareWarning,
  PackageCheck,
  Search,
  XCircle,
} from "lucide-react";

interface ProductApprovalManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const SORTABLE_COLUMNS: {
  column: AdminReviewSortBy;
  defaultOrder: SortOrder;
}[] = [
  { column: "submitted_at", defaultOrder: "desc" },
  { column: "reviewed_at", defaultOrder: "desc" },
  { column: "name", defaultOrder: "asc" },
  { column: "seller_name", defaultOrder: "asc" },
  { column: "price", defaultOrder: "desc" },
  { column: "created_at", defaultOrder: "desc" },
];

function getDefaultSortOrder(column: AdminReviewSortBy): SortOrder {
  return getColumnDefaultOrder(column, SORTABLE_COLUMNS);
}

function formatMoney(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency || ""} ${price}`.trim();
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

function SortableColumnHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: AdminReviewSortBy;
  sortBy: AdminReviewSortBy | null;
  sortOrder: SortOrder;
  onSort: (column: AdminReviewSortBy) => void;
}) {
  const isActive = sortBy === column;

  return (
    <th className="px-4 py-3 text-left font-medium sm:px-6">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md transition-colors",
          "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          isActive ? "text-primary" : "text-foreground"
        )}
        aria-sort={
          isActive ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span>{label}</span>
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )
        ) : (
          <ArrowUpDown
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
            aria-hidden
          />
        )}
      </button>
    </th>
  );
}

function TableLoadingOverlay({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
          <Loader size="lg" />
        </div>
      ) : null}
    </div>
  );
}

function ProductThumb({
  thumbnail,
  name,
}: {
  thumbnail: string | null;
  name: string;
}) {
  const src = resolveMediaDisplayUrl(thumbnail);

  if (!src) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function StatusFilterChips({
  value,
  onChange,
}: {
  value: ProductApprovalStatus | "all";
  onChange: (value: ProductApprovalStatus | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRODUCT_APPROVAL_STATUS_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
              isActive
                ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function toastDecisionResult(
  action: ProductDecisionAction,
  result: AdminProductDecisionResult
) {
  const labels = {
    approve: "approved",
    request_revision: "marked for revision",
    reject: "rejected",
  } as const;

  if (result.succeeded.length > 0) {
    toast.success(
      result.succeeded.length === 1
        ? `Product ${labels[action]}`
        : `${result.succeeded.length} products ${labels[action]}`
    );
  }

  if (result.failed.length > 0) {
    const first = result.failed[0];
    toast.error(
      result.failed.length === 1
        ? first.message || `Product ${first.id} failed`
        : `${result.failed.length} products failed — ${first.message || "see details"}`
    );
  }
}

export function ProductApprovalManagement({
  title,
  basePath,
}: ProductApprovalManagementProps) {
  const [products, setProducts] = useState<PaginatedData<ProductReviewItem>>({
    results: [],
    pagination: defaultPagination,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<
    ProductApprovalStatus | "all"
  >("in_review");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<AdminReviewSortBy | null>("submitted_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [decisionAction, setDecisionAction] =
    useState<ProductDecisionAction | null>(null);
  const [decisionProducts, setDecisionProducts] = useState<ProductReviewItem[]>(
    []
  );
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductReviewItem | null>(
    null
  );
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailHistory, setDetailHistory] = useState<
    ProductReviewHistoryEntry[]
  >([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const prevSearchRef = useRef("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsService.getAdminReviews({
        page,
        limit,
        search: search || undefined,
        approval_status: statusFilter,
        sort_by: sortBy ?? "submitted_at",
        sort_order: sortBy ? sortOrder : "desc",
      });
      setProducts(data);
      setHasLoaded(true);
      setSelectedIds((prev) =>
        prev.filter((id) => data.results.some((item) => item.id === id))
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load review queue"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== prevSearchRef.current) {
        prevSearchRef.current = searchInput;
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const handleColumnSort = (column: AdminReviewSortBy) => {
    setPage(1);
    const next = nextColumnSortState({
      column,
      sortBy,
      sortOrder,
      defaultOrder: getDefaultSortOrder(column),
    });
    setSortBy(next.sortBy);
    setSortOrder(next.sortOrder);
  };

  const selectableOnPage = useMemo(
    () => products.results.filter((item) => item.approval_status === "in_review"),
    [products.results]
  );

  const allSelectableSelected =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((item) => selectedIds.includes(item.id));

  const selectedOnPage = products.results.filter((item) =>
    selectedIds.includes(item.id)
  );

  const openDecision = (
    action: ProductDecisionAction,
    items: ProductReviewItem[]
  ) => {
    const eligible = items.filter((item) => item.approval_status === "in_review");
    if (eligible.length === 0) {
      toast.error("Only products in review can be moderated.");
      return;
    }
    setDecisionProducts(eligible);
    setDecisionAction(action);
  };

  const closeDecision = () => {
    if (decisionLoading) return;
    setDecisionAction(null);
    setDecisionProducts([]);
  };

  const handleDecisionSubmit = async (remarks?: string) => {
    if (!decisionAction || decisionProducts.length === 0) return;

    setDecisionLoading(true);
    const product_ids = decisionProducts.map((item) => item.id);

    try {
      let result: AdminProductDecisionResult;

      if (decisionAction === "approve") {
        result = await productsService.approveProducts({ product_ids, remarks });
      } else if (decisionAction === "request_revision") {
        result = await productsService.requestProductRevision({
          product_ids,
          remarks,
        });
      } else {
        result = await productsService.rejectProducts({ product_ids, remarks });
      }

      toastDecisionResult(decisionAction, result);
      setDecisionAction(null);
      setDecisionProducts([]);
      setSelectedIds((prev) =>
        prev.filter((id) => !result.succeeded.some((item) => item.id === id))
      );

      if (
        detailProduct &&
        result.succeeded.some((item) => item.id === detailProduct.id)
      ) {
        setDetailProduct(null);
        setDetail(null);
        setDetailHistory([]);
      }

      await fetchReviews();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update products"
      );
    } finally {
      setDecisionLoading(false);
    }
  };

  const openDetail = async (item: ProductReviewItem) => {
    setDetailProduct(item);
    setDetail(null);
    setDetailHistory([]);
    setDetailLoading(true);

    try {
      const [product, history] = await Promise.all([
        productsService.getProduct(item.id),
        productsService.getProductReviews(item.id, { page: 1, limit: 20 }),
      ]);
      setDetail(product);
      setDetailHistory(history.results);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load product details"
      );
      setDetailProduct(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleSelect = (id: number, eligible: boolean) => {
    if (!eligible) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      const pageIds = new Set(selectableOnPage.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableOnPage.forEach((item) => next.add(item.id));
      return [...next];
    });
  };

  if (!hasLoaded && loading) {
    return <DashboardSkeleton />;
  }

  const hasActiveFilters = Boolean(search) || statusFilter !== "in_review";
  const detailStatus = detail?.approval_status ?? detailProduct?.approval_status;
  const canModerateDetail = detailStatus === "in_review";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="hidden sm:block">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: `${basePath}/dashboard` },
            { label: title },
          ]}
        />
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight sm:mt-2 md:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Review seller listings, approve them for buyers, or request changes.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageCheck className="h-4 w-4 shrink-0" />
              Review queue ({loading ? "…" : products.pagination.total})
            </CardTitle>

            {selectedOnPage.length > 0 || selectedIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openDecision(
                      "approve",
                      products.results.filter((item) =>
                        selectedIds.includes(item.id)
                      )
                    )
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve ({selectedIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openDecision(
                      "request_revision",
                      products.results.filter((item) =>
                        selectedIds.includes(item.id)
                      )
                    )
                  }
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  Revision
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    openDecision(
                      "reject",
                      products.results.filter((item) =>
                        selectedIds.includes(item.id)
                      )
                    )
                  }
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search product, seller, category, brand…"
                className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <StatusFilterChips
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
                setSelectedIds([]);
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && products.results.length === 0 ? (
            <div className="overflow-x-auto px-4 py-4 sm:px-0">
              <table className="w-full min-w-[64rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <th key={index} className="px-4 py-3 sm:px-6">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3.5 sm:px-6" colSpan={8}>
                        <Skeleton className="h-11 w-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : products.results.length === 0 ? (
            <EmptyState
              icon={<PackageCheck className="h-8 w-8 text-muted-foreground" />}
              title={
                hasActiveFilters ? "No products found" : "Queue is clear"
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your search or status filter."
                  : "There are no products waiting for review right now."
              }
            />
          ) : (
            <>
              <TableLoadingOverlay loading={loading}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[64rem] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="w-12 px-4 py-3 sm:px-6">
                          <input
                            type="checkbox"
                            checked={allSelectableSelected}
                            disabled={selectableOnPage.length === 0}
                            onChange={toggleSelectAll}
                            aria-label="Select all in-review products on this page"
                            className="h-4 w-4 rounded border-border"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                          Product
                        </th>
                        <SortableColumnHeader
                          label="Seller"
                          column="seller_name"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          onSort={handleColumnSort}
                        />
                        <SortableColumnHeader
                          label="Price"
                          column="price"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          onSort={handleColumnSort}
                        />
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                          Status
                        </th>
                        <SortableColumnHeader
                          label="Submitted"
                          column="submitted_at"
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          onSort={handleColumnSort}
                        />
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                          Remarks
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.results.map((item) => {
                        const inReview = item.approval_status === "in_review";
                        const seller =
                          item.seller_name?.trim() ||
                          item.supplier_name?.trim() ||
                          "—";

                        return (
                          <tr
                            key={item.id}
                            className="group transition-colors hover:bg-muted/25"
                          >
                            <td className="px-4 py-3.5 sm:px-6">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                disabled={!inReview}
                                onChange={() => toggleSelect(item.id, inReview)}
                                aria-label={`Select ${item.name}`}
                                className="h-4 w-4 rounded border-border disabled:opacity-40"
                              />
                            </td>
                            <td className="px-4 py-3.5 sm:px-6">
                              <div className="flex items-center gap-3">
                                <ProductThumb
                                  thumbnail={item.thumbnail}
                                  name={item.name}
                                />
                                <div className="min-w-0">
                                  <p className="max-w-[14rem] truncate font-semibold leading-snug sm:max-w-xs">
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    v{item.review_version}
                                    {item.category_name
                                      ? ` · ${item.category_name}`
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                              <p className="max-w-[10rem] truncate sm:max-w-[12rem]">
                                {seller}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 sm:px-6">
                              {formatMoney(item.price, item.currency)}
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                MOQ {item.moq} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 sm:px-6">
                              <Badge
                                variant={approvalBadgeVariant(
                                  item.approval_status
                                )}
                              >
                                {approvalLabel(item.approval_status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                              {formatDateTime(item.submitted_at)}
                            </td>
                            <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                              <p className="max-w-[12rem] truncate sm:max-w-[16rem]">
                                {item.latest_review_remarks?.trim() || "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 sm:px-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                  onClick={() => void openDetail(item)}
                                  aria-label={`View ${item.name}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {inReview ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                      onClick={() =>
                                        openDecision("approve", [item])
                                      }
                                      aria-label={`Approve ${item.name}`}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                                      onClick={() =>
                                        openDecision("request_revision", [item])
                                      }
                                      aria-label={`Request revision for ${item.name}`}
                                    >
                                      <MessageSquareWarning className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() =>
                                        openDecision("reject", [item])
                                      }
                                      aria-label={`Reject ${item.name}`}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableLoadingOverlay>

              <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
                <Pagination
                  pagination={products.pagination}
                  onPageChange={setPage}
                  className="pt-0"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductDecisionDialog
        open={!!decisionAction}
        action={decisionAction}
        products={decisionProducts}
        loading={decisionLoading}
        onClose={closeDecision}
        onSubmit={handleDecisionSubmit}
      />

      <Modal
        open={!!detailProduct}
        onClose={() => {
          if (!detailLoading) {
            setDetailProduct(null);
            setDetail(null);
            setDetailHistory([]);
          }
        }}
        title={detailProduct?.name ?? "Product details"}
        description="Listing details and review history"
        icon={<PackageCheck className="h-5 w-5" />}
        className="w-full max-w-2xl"
      >
        {detailLoading ? (
          <div className="flex justify-center px-5 py-10 sm:px-6">
            <Loader size="lg" />
          </div>
        ) : detail ? (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="flex gap-4">
              <ProductThumb thumbnail={detail.thumbnail} name={detail.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={approvalBadgeVariant(detail.approval_status)}>
                    {approvalLabel(detail.approval_status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Review v{detail.review_version}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatMoney(detail.price, detail.currency)} · MOQ{" "}
                  {detail.moq} {detail.unit}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seller:{" "}
                  {detail.seller_name?.trim() ||
                    detail.supplier_name?.trim() ||
                    "—"}
                </p>
              </div>
            </div>

            {(detail.short_description || detail.description) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {detail.short_description || detail.description}
                </p>
              </div>
            )}

            {detail.latest_review_remarks ? (
              <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Latest remarks
                </p>
                <p className="mt-1 text-sm">{detail.latest_review_remarks}</p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Review history
              </p>
              {detailHistory.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No review events yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {detailHistory.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-xl border border-border px-3 py-2.5"
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

            {canModerateDetail && detailProduct ? (
              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => openDecision("reject", [detailProduct])}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    openDecision("request_revision", [detailProduct])
                  }
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  Request revision
                </Button>
                <Button
                  type="button"
                  onClick={() => openDecision("approve", [detailProduct])}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
