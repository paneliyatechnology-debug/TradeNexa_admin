"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ProductDecisionDialog,
  type ProductDecisionAction,
} from "@/components/product-approval/product-decision-dialog";
import { ProductDetailPanel } from "@/components/product-approval/product-detail-panel";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  SortableTableHead,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeadRow,
  TableLoadingOverlay,
  TableRow,
  TableRowsSkeleton,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { IconButton } from "@/components/ui/icon-button";
import { Loader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
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
import { getColumnDefaultOrder, nextColumnSortState } from "@/utils/column-sort";
import {
  CheckCircle2,
  Eye,
  ImageIcon,
  MessageSquareWarning,
  PackageCheck,
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

function formatMoney(
  price: number | null | undefined,
  currency: string
): string {
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
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
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 md:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
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
            <SearchField
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search product, seller, category, brand…"
            />
            <FilterChips
              options={PRODUCT_APPROVAL_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
                setSelectedIds([]);
              }}
              aria-label="Approval status"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && products.results.length === 0 ? (
            <div className="px-4 py-4 sm:px-0">
              <DataTable minWidthClassName="min-w-[64rem]">
                <thead>
                  <TableHeadRow>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <TableHeadCell key={index}>
                        <Skeleton className="h-4 w-16" />
                      </TableHeadCell>
                    ))}
                  </TableHeadRow>
                </thead>
                <TableBody>
                  <TableRowsSkeleton rows={5} columns={8} />
                </TableBody>
              </DataTable>
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
                <DataTable minWidthClassName="min-w-[64rem]">
                  <thead>
                    <TableHeadRow>
                      <TableHeadCell className="w-12">
                        <input
                          type="checkbox"
                          checked={allSelectableSelected}
                          disabled={selectableOnPage.length === 0}
                          onChange={toggleSelectAll}
                          aria-label="Select all in-review products on this page"
                          className="h-4 w-4 rounded border-border"
                        />
                      </TableHeadCell>
                      <TableHeadCell>Product</TableHeadCell>
                      <SortableTableHead
                        label="Seller"
                        column="seller_name"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleColumnSort}
                      />
                      <SortableTableHead
                        label="Price"
                        column="price"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleColumnSort}
                      />
                      <TableHeadCell>Status</TableHeadCell>
                      <SortableTableHead
                        label="Submitted"
                        column="submitted_at"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleColumnSort}
                      />
                      <TableHeadCell>Remarks</TableHeadCell>
                      <TableHeadCell align="right">Actions</TableHeadCell>
                    </TableHeadRow>
                  </thead>
                  <TableBody>
                    {products.results.map((item) => {
                      const inReview = item.approval_status === "in_review";
                      const seller =
                        item.seller_name?.trim() ||
                        item.supplier_name?.trim() ||
                        "—";

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              disabled={!inReview}
                              onChange={() => toggleSelect(item.id, inReview)}
                              aria-label={`Select ${item.name}`}
                              className="h-4 w-4 rounded border-border disabled:opacity-40"
                            />
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <p className="max-w-[10rem] truncate sm:max-w-[12rem]">
                              {seller}
                            </p>
                          </TableCell>
                          <TableCell>
                            {formatMoney(item.price, item.currency)}
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              MOQ {item.moq} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={approvalBadgeVariant(
                                item.approval_status
                              )}
                            >
                              {approvalLabel(item.approval_status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(item.submitted_at)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <p className="max-w-[12rem] truncate sm:max-w-[16rem]">
                              {item.latest_review_remarks?.trim() || "—"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1.5">
                              <IconButton
                                label="View details"
                                tone="view"
                                onClick={() => void openDetail(item)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </IconButton>
                              {inReview ? (
                                <>
                                  <IconButton
                                    label="Approve"
                                    tone="success"
                                    onClick={() =>
                                      openDecision("approve", [item])
                                    }
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </IconButton>
                                  <IconButton
                                    label="Request revision"
                                    tone="warning"
                                    onClick={() =>
                                      openDecision("request_revision", [item])
                                    }
                                  >
                                    <MessageSquareWarning className="h-3.5 w-3.5" />
                                  </IconButton>
                                  <IconButton
                                    label="Reject"
                                    tone="danger"
                                    onClick={() =>
                                      openDecision("reject", [item])
                                    }
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </IconButton>
                                </>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </DataTable>
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
        className="w-full max-w-4xl max-h-[min(92vh,52rem)]"
        footer={
          canModerateDetail && detailProduct && detail && !detailLoading ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          ) : undefined
        }
      >
        {detailLoading ? (
          <div className="flex justify-center px-4 py-10 sm:px-5">
            <Loader size="lg" />
          </div>
        ) : detail ? (
          <ProductDetailPanel detail={detail} history={detailHistory} />
        ) : null}
      </Modal>
    </div>
  );
}
