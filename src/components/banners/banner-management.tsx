"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { BannerForm } from "@/components/banners/banner-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { bannersService } from "@/services/banners.service";
import type { PaginatedData, SortOrder } from "@/types/api";
import type { Banner, BannerSortBy, CreateBannerInput, UpdateBannerInput } from "@/types/banner";
import { parseBannerRedirectType } from "@/types/banner";
import type { BannerFormData } from "@/utils/validators";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import {
  GripVertical,
  ImageIcon,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getColumnDefaultOrder, nextColumnSortState } from "@/utils/column-sort";

interface BannerManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const SORTABLE_COLUMNS: { column: BannerSortBy; label: string; defaultOrder: SortOrder }[] = [
  { column: "title", label: "Title", defaultOrder: "asc" },
  { column: "priority", label: "Priority", defaultOrder: "asc" },
  { column: "created_at", label: "Created", defaultOrder: "desc" },
];

function getDefaultSortOrder(column: BannerSortBy): SortOrder {
  return getColumnDefaultOrder(column, SORTABLE_COLUMNS);
}

function getNextPriority(items: Banner[], total: number): number {
  if (items.length === 0) return Math.max(total, 0) + 1;
  return Math.max(...items.map((banner) => banner.priority), 0, total) + 1;
}

function BannerTableHeader({
  sortBy,
  sortOrder,
  onSort,
  showDragColumn,
}: {
  sortBy: BannerSortBy | null;
  sortOrder: SortOrder;
  onSort: (column: BannerSortBy) => void;
  showDragColumn: boolean;
}) {
  return (
    <TableHeadRow>
      {showDragColumn ? (
        <TableHeadCell className="w-10 px-2 sm:px-3" aria-label="Reorder" />
      ) : null}
      <TableHeadCell>Image</TableHeadCell>
      <SortableTableHead
        label="Title"
        column="title"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <SortableTableHead
        label="Priority"
        column="priority"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <TableHeadCell>Redirect</TableHeadCell>
      <SortableTableHead
        label="Created"
        column="created_at"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <TableHeadCell>Actions</TableHeadCell>
    </TableHeadRow>
  );
}

function formatCreatedLabel(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRedirectLabel(banner: Banner): string {
  if (banner.redirect_type && banner.redirect_id) {
    return `${banner.redirect_type} #${banner.redirect_id}`;
  }

  return "No redirect";
}

function bannerToUpdatePayload(banner: Banner): UpdateBannerInput {
  return {
    title: banner.title,
    redirect_type: parseBannerRedirectType(banner.redirect_type),
    redirect_id: banner.redirect_id,
    priority: banner.priority,
  };
}

function applySequentialPriorities(ordered: Banner[], startPriority: number): Banner[] {
  return ordered.map((banner, index) => ({
    ...banner,
    priority: startPriority + index,
  }));
}

function BannerImageThumb({ image, title }: { image: string | null; title: string }) {
  const src = resolveMediaDisplayUrl(image);

  if (!src) {
    return (
      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className="h-14 w-20 shrink-0 rounded-lg border border-border bg-background object-cover"
      referrerPolicy="no-referrer"
    />
  );
}

function BannerTableRow({
  banner,
  dragDropEnabled,
  reorderingId,
  draggingBannerId,
  activeDrag,
  dragStyle,
  rowRef,
  onGripPointerDown,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  dragDropEnabled: boolean;
  reorderingId: number | null;
  draggingBannerId: number | null;
  activeDrag: ActiveBannerDrag | null;
  dragStyle: CSSProperties;
  rowRef: (element: HTMLTableRowElement | null) => void;
  onGripPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const createdLabel = formatCreatedLabel(banner.created_at);

  return (
    <TableRow
      ref={rowRef}
      style={dragStyle}
      className={cn(
        dragDropEnabled && draggingBannerId === null && reorderingId === null && "will-change-transform",
        activeDrag?.id === banner.id && "bg-card ring-1 ring-inset ring-primary/20"
      )}
    >
      {dragDropEnabled ? (
        <TableCell className="px-2 sm:px-3">
          <button
            type="button"
            onPointerDown={onGripPointerDown}
            disabled={reorderingId !== null || draggingBannerId !== null}
            className={cn(
              "flex h-9 w-9 touch-none items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors",
              "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              draggingBannerId === banner.id &&
                "cursor-grabbing border-primary/50 bg-primary/10 text-primary"
            )}
            aria-label={`Drag ${banner.title} to reorder`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </TableCell>
      ) : null}
      <TableCell>
        <BannerImageThumb image={banner.image} title={banner.title} />
      </TableCell>
      <TableCell>
        <p className="max-w-[12rem] font-medium leading-snug sm:max-w-xs">{banner.title}</p>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{banner.priority}</Badge>
      </TableCell>
      <TableCell>
        <p className="max-w-[10rem] text-sm text-muted-foreground sm:max-w-xs">
          {formatRedirectLabel(banner)}
        </p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {createdLabel ?? "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <IconButton label="Edit banner" tone="view" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Delete banner" tone="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

function BannerTableRowsSkeleton({
  rows = 5,
  showDragColumn,
}: {
  rows?: number;
  showDragColumn: boolean;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          {showDragColumn ? (
            <TableCell className="px-2 sm:px-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
            </TableCell>
          ) : null}
          <TableCell>
            <Skeleton className="h-14 w-20 rounded-lg" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-10 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface ActiveBannerDrag {
  id: number;
  startIndex: number;
  currentIndex: number;
  pointerY: number;
  startPointerY: number;
  itemHeight: number;
}

function getBannerDragStyle(
  bannerId: number,
  index: number,
  activeDrag: ActiveBannerDrag | null
): CSSProperties {
  if (!activeDrag) return {};

  const { id, startIndex, currentIndex, pointerY, startPointerY, itemHeight } = activeDrag;
  const pointerDelta = pointerY - startPointerY;
  const transition = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease, opacity 200ms ease";

  if (bannerId === id) {
    const isSnapBack = pointerY === startPointerY && currentIndex === startIndex;

    return {
      transform: `translate3d(0, ${pointerDelta}px, 0) scale(1.015)`,
      zIndex: 30,
      transition: isSnapBack
        ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease"
        : "box-shadow 200ms ease",
      boxShadow: "0 16px 40px -12px color-mix(in srgb, var(--primary) 35%, transparent)",
    };
  }

  if (startIndex < currentIndex && index > startIndex && index <= currentIndex) {
    return {
      transform: `translate3d(0, -${itemHeight}px, 0)`,
      transition,
    };
  }

  if (startIndex > currentIndex && index >= currentIndex && index < startIndex) {
    return {
      transform: `translate3d(0, ${itemHeight}px, 0)`,
      transition,
    };
  }

  return { transition };
}

export function BannerManagement({ title, basePath }: BannerManagementProps) {
  const [banners, setBanners] = useState<PaginatedData<Banner>>({
    results: [],
    pagination: defaultPagination,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<BannerSortBy | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [dragDropEnabled, setDragDropEnabled] = useState(false);
  const [reorderBanners, setReorderBanners] = useState<Banner[] | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveBannerDrag | null>(null);
  const [draggingBannerId, setDraggingBannerId] = useState<number | null>(null);

  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const activeDragRef = useRef<ActiveBannerDrag | null>(null);
  const bannersRef = useRef(banners.results);
  const prevSearchRef = useRef("");

  const bannerList = banners.results;
  const displayList = dragDropEnabled && reorderBanners ? reorderBanners : bannerList;
  const canReorder = sortBy === "priority" && sortOrder === "asc" && !search;
  const showDragColumn = canReorder && dragDropEnabled && displayList.length > 1;
  const isReorderView = dragDropEnabled && reorderBanners !== null;

  useEffect(() => {
    activeDragRef.current = activeDrag;
  }, [activeDrag]);

  useEffect(() => {
    bannersRef.current = displayList;
  }, [displayList]);

  const fetchBanners = useCallback(async () => {
    if (dragDropEnabled) return;

    setLoading(true);
    try {
      const data = await bannersService.getBanners({
        page,
        limit,
        search: search || undefined,
        sort_by: sortBy ?? undefined,
        sort_order: sortBy ? sortOrder : undefined,
      });
      setBanners(data);
      setHasLoaded(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, dragDropEnabled]);

  const exitReorderMode = useCallback(async () => {
    setDragDropEnabled(false);
    setReorderBanners(null);
    setActiveDrag(null);
    setDraggingBannerId(null);
    setLoading(true);
    try {
      const data = await bannersService.getBanners({
        page,
        limit,
        search: search || undefined,
        sort_by: sortBy ?? undefined,
        sort_order: sortBy ? sortOrder : undefined,
      });
      setBanners(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  const enterReorderMode = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await bannersService.getBanners({
        page: 1,
        limit: 1,
        sort_by: "priority",
        sort_order: "asc",
      });
      const total = summary.pagination.total;

      if (total <= 1) {
        setDragDropEnabled(false);
        setReorderBanners(null);
        setBanners(summary);
        return;
      }

      const data = await bannersService.getBanners({
        page: 1,
        limit: total,
        sort_by: "priority",
        sort_order: "asc",
      });
      setReorderBanners(data.results);
      setBanners((current) => ({
        ...current,
        pagination: data.pagination,
      }));
      setDragDropEnabled(true);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load banners for reordering");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDragReorder = useCallback(async () => {
    if (dragDropEnabled) {
      await exitReorderMode();
      return;
    }

    await enterReorderMode();
  }, [dragDropEnabled, enterReorderMode, exitReorderMode]);

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
    void fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!canReorder) {
      setDragDropEnabled(false);
      setReorderBanners(null);
      setActiveDrag(null);
      setDraggingBannerId(null);
    }
  }, [canReorder]);

  const toCreatePayload = (data: BannerFormData): CreateBannerInput => {
    if (!(data.image instanceof File)) {
      throw new Error("Banner image is required");
    }

    return {
      title: data.title.trim(),
      image: data.image,
      redirect_type: data.redirect_type,
      redirect_id: data.redirect_id,
      priority: getNextPriority(bannerList, banners.pagination.total),
    };
  };

  const toUpdatePayload = (data: BannerFormData): UpdateBannerInput => {
    if (!editBanner) {
      throw new Error("No banner selected for update");
    }

    return {
      title: data.title.trim(),
      image: data.image ?? null,
      clear_image: data.clear_image,
      redirect_type: data.redirect_type,
      redirect_id: data.redirect_id,
      priority: editBanner.priority,
    };
  };

  const persistPriorityOrder = async (ordered: Banner[], original: Banner[]) => {
    const changed = ordered.filter((banner) => {
      const previous = original.find((item) => item.id === banner.id);
      return previous && previous.priority !== banner.priority;
    });

    await Promise.all(
      changed.map((banner) =>
        bannersService.updateBanner(banner.id, bannerToUpdatePayload(banner))
      )
    );
  };

  const applyReorder = async (reordered: Banner[], activeId: number) => {
    const startPriority = 1;
    const withPriorities = applySequentialPriorities(reordered, startPriority);

    setReorderingId(activeId);
    try {
      await persistPriorityOrder(withPriorities, bannersRef.current);
      setReorderBanners(withPriorities);
      toast.success("Banner order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update banner order");
    } finally {
      setReorderingId(null);
    }
  };

  const setRowRef = useCallback((bannerId: number, element: HTMLTableRowElement | null) => {
    if (element) {
      rowRefs.current.set(bannerId, element);
      return;
    }

    rowRefs.current.delete(bannerId);
  }, []);

  const handleGripPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    bannerId: number,
    index: number
  ) => {
    if (!dragDropEnabled || reorderingId !== null) return;

    const row = rowRefs.current.get(bannerId);
    if (!row) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    document.body.style.userSelect = "none";

    setDraggingBannerId(bannerId);
    setActiveDrag({
      id: bannerId,
      startIndex: index,
      currentIndex: index,
      pointerY: event.clientY,
      startPointerY: event.clientY,
      itemHeight: row.offsetHeight,
    });
  };

  const finishDrag = useCallback(async (drag: ActiveBannerDrag | null) => {
    if (!drag) {
      document.body.style.userSelect = "";
      setDraggingBannerId(null);
      setActiveDrag(null);
      return;
    }

    if (drag.currentIndex === drag.startIndex) {
      setActiveDrag({
        ...drag,
        pointerY: drag.startPointerY,
        currentIndex: drag.startIndex,
      });

      window.setTimeout(() => {
        document.body.style.userSelect = "";
        setDraggingBannerId(null);
        setActiveDrag(null);
      }, 280);

      return;
    }

    document.body.style.userSelect = "";
    setDraggingBannerId(null);
    setActiveDrag(null);

    const currentBanners = bannersRef.current;
    const reordered = [...currentBanners];
    const [moved] = reordered.splice(drag.startIndex, 1);
    reordered.splice(drag.currentIndex, 0, moved);

    const startPriority = 1;
    const withPriorities = applySequentialPriorities(reordered, startPriority);

    setReorderingId(drag.id);
    try {
      await persistPriorityOrder(withPriorities, currentBanners);
      setReorderBanners(withPriorities);
      toast.success("Banner order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update banner order");
    } finally {
      setReorderingId(null);
    }
  }, []);

  useEffect(() => {
    if (draggingBannerId === null) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag) return;

      let currentIndex = 0;
      const currentBanners = bannersRef.current;

      for (let index = 0; index < currentBanners.length; index += 1) {
        const row = rowRefs.current.get(currentBanners[index].id);
        if (!row) continue;

        const rect = row.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (event.clientY < midpoint) {
          currentIndex = index;
          setActiveDrag({
            ...drag,
            pointerY: event.clientY,
            currentIndex,
          });
          return;
        }
      }

      currentIndex = Math.max(currentBanners.length - 1, 0);
      setActiveDrag({
        ...drag,
        pointerY: event.clientY,
        currentIndex,
      });
    };

    const handlePointerEnd = () => {
      void finishDrag(activeDragRef.current);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [draggingBannerId, finishDrag]);

  const refreshBanners = useCallback(async () => {
    if (dragDropEnabled) {
      await enterReorderMode();
      return;
    }

    await fetchBanners();
  }, [dragDropEnabled, enterReorderMode, fetchBanners]);

  const handleCreate = async (data: BannerFormData) => {
    try {
      await bannersService.createBanner(toCreatePayload(data));
      toast.success("Banner created successfully");
      setCreateOpen(false);
      await refreshBanners();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create banner");
    }
  };

  const handleUpdate = async (data: BannerFormData) => {
    if (!editBanner) return;

    try {
      await bannersService.updateBanner(editBanner.id, toUpdatePayload(data));
      toast.success("Banner updated successfully");
      setEditBanner(null);
      await refreshBanners();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update banner");
    }
  };

  const handleDelete = async () => {
    if (!deleteBanner) return;

    setDeleting(true);
    try {
      await bannersService.deleteBanner(deleteBanner.id);
      toast.success("Banner deleted successfully");
      setDeleteBanner(null);

      if (!dragDropEnabled) {
        const nextPage =
          bannerList.length === 1 && page > 1 ? page - 1 : page;
        setPage(nextPage);
      }

      await refreshBanners();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete banner");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = async (banner: Banner) => {
    setEditBanner(banner);
    setEditLoading(true);

    try {
      const detail = await bannersService.getBanner(banner.id);
      setEditBanner(detail);
    } catch (error) {
      setEditBanner(null);
      toast.error(error instanceof Error ? error.message : "Failed to load banner details");
    } finally {
      setEditLoading(false);
    }
  };

  const handleColumnSort = (column: BannerSortBy) => {
    if (isReorderView) return;

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

  if (!hasLoaded && loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: `${basePath}/dashboard` },
            { label: title },
          ]}
        />
        <h1 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Design homepage banners and arrange them to showcase featured content.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 shrink-0" />
              Banners ({loading ? "…" : banners.pagination.total})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              {canReorder && banners.pagination.total > 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant={dragDropEnabled ? "primary" : "outline"}
                  onClick={() => void toggleDragReorder()}
                  disabled={reorderingId !== null || draggingBannerId !== null || loading}
                  aria-pressed={dragDropEnabled}
                  className="w-full sm:w-auto"
                >
                  <GripVertical className="h-4 w-4" />
                  {dragDropEnabled ? "Done Reordering" : "Drag to Reorder"}
                </Button>
              ) : null}
              <Button size="sm" onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Banner
              </Button>
            </div>
          </div>

          <SearchField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search banners..."
            disabled={isReorderView}
          />

          {isReorderView ? (
            <p className="text-sm text-muted-foreground">
              Showing all {displayList.length} banners. Drag to set homepage order, then
              click Done Reordering to return to the paginated view.
            </p>
          ) : dragDropEnabled && canReorder && displayList.length > 1 ? (
            <p className="text-sm text-muted-foreground">
              Drag banners by the handle to change their order.
            </p>
          ) : !canReorder && banners.pagination.total > 0 ? (
            <p className="text-sm text-muted-foreground">
              Sort by Priority (ascending) and clear search to reorder banners.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          {loading && displayList.length === 0 ? (
            <div className="px-4 py-4 sm:px-0">
              <DataTable minWidthClassName="min-w-[52rem]">
                <thead>
                  <BannerTableHeader
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleColumnSort}
                    showDragColumn={showDragColumn}
                  />
                </thead>
                <TableBody>
                  <BannerTableRowsSkeleton showDragColumn={showDragColumn} />
                </TableBody>
              </DataTable>
            </div>
          ) : displayList.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-8 w-8 text-muted-foreground" />}
              title={search ? "No banners found" : "No banners yet"}
              description={
                search
                  ? "Try adjusting your search or sort."
                  : "Create your first promotional banner for the marketplace."
              }
              action={
                !search ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Banner
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <TableLoadingOverlay loading={loading}>
                <DataTable
                  minWidthClassName="min-w-[52rem]"
                  className={cn(draggingBannerId !== null && "select-none")}
                >
                  <thead>
                    <BannerTableHeader
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleColumnSort}
                      showDragColumn={showDragColumn}
                    />
                  </thead>
                  <TableBody>
                    {displayList.map((banner, index) => (
                      <BannerTableRow
                        key={banner.id}
                        rowRef={(element) => setRowRef(banner.id, element)}
                        banner={banner}
                        dragDropEnabled={showDragColumn}
                        reorderingId={reorderingId}
                        draggingBannerId={draggingBannerId}
                        activeDrag={activeDrag}
                        dragStyle={getBannerDragStyle(banner.id, index, activeDrag)}
                        onGripPointerDown={(event) =>
                          handleGripPointerDown(event, banner.id, index)
                        }
                        onEdit={() => void openEdit(banner)}
                        onDelete={() => setDeleteBanner(banner)}
                      />
                    ))}
                  </TableBody>
                </DataTable>
              </TableLoadingOverlay>

              {!isReorderView ? (
                <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
                  <Pagination
                    pagination={banners.pagination}
                    onPageChange={setPage}
                    className="pt-0"
                  />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Banner"
        description="Create a new promotional banner with image and redirect target."
        icon={<Megaphone className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        <BannerForm
          key={createOpen ? "create-banner-open" : "create-banner-closed"}
          formKey={createOpen ? "create-banner-open" : "create-banner-closed"}
          submitLabel="Create Banner"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editBanner}
        onClose={() => !editLoading && setEditBanner(null)}
        title="Edit Banner"
        description="Update banner image and redirect target."
        icon={<Pencil className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        {editBanner &&
          (editLoading ? (
            <div className="flex justify-center px-5 py-10 sm:px-6">
              <Loader size="lg" />
            </div>
          ) : (
            <BannerForm
              key={`edit-banner-${editBanner.id}`}
              formKey={`edit-banner-${editBanner.id}`}
              mode="edit"
              submitLabel="Save Changes"
              initialValues={{
                title: editBanner.title,
                redirect_type: parseBannerRedirectType(editBanner.redirect_type),
                redirect_id: editBanner.redirect_id ?? null,
                imageUrl: editBanner.image,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditBanner(null)}
            />
          ))}
      </Modal>

      <ConfirmDialog
        open={!!deleteBanner}
        onClose={() => !deleting && setDeleteBanner(null)}
        onConfirm={handleDelete}
        title="Delete this banner?"
        loading={deleting}
        confirmLabel="Delete Banner"
        icon={<Trash2 className="h-7 w-7" />}
        preview={
          deleteBanner ? (
            <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
              {resolveMediaDisplayUrl(deleteBanner.image) ? (
                <img
                  src={resolveMediaDisplayUrl(deleteBanner.image)!}
                  alt={deleteBanner.title}
                  className="h-28 w-full rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <p className="mt-2 truncate px-1 text-sm font-medium text-foreground">
                {deleteBanner.title}
              </p>
            </div>
          ) : null
        }
        description={
          <>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">
              &ldquo;{deleteBanner?.title}&rdquo;
            </span>{" "}
            from your homepage banners. This action cannot be undone.
          </>
        }
      />
    </div>
  );
}
