"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { BannerForm } from "@/components/banners/banner-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { bannersService } from "@/services/banners.service";
import type { Banner, CreateBannerInput, UpdateBannerInput } from "@/types/banner";
import { parseBannerRedirectType } from "@/types/banner";
import type { BannerFormData } from "@/utils/validators";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { ImageIcon, Megaphone, Pencil, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";

interface BannerManagementProps {
  title: string;
  basePath: string;
}

function sortBanners(data: Banner[]): Banner[] {
  return [...data].sort((a, b) => a.priority - b.priority || a.id - b.id);
}

function getNextPriority(banners: Banner[]): number {
  if (banners.length === 0) return 1;
  return Math.max(...banners.map((banner) => banner.priority)) + 1;
}

function bannerToUpdatePayload(banner: Banner): UpdateBannerInput {
  return {
    title: banner.title,
    redirect_type: parseBannerRedirectType(banner.redirect_type),
    redirect_id: banner.redirect_id,
    priority: banner.priority,
  };
}

function applySequentialPriorities(ordered: Banner[]): Banner[] {
  return ordered.map((banner, index) => ({
    ...banner,
    priority: index + 1,
  }));
}

function BannerImage({ image, title }: { image: string | null; title: string }) {
  const src = resolveMediaDisplayUrl(image);

  if (!src) {
    return (
      <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className="h-14 w-24 shrink-0 rounded-lg border border-border bg-background object-cover"
      referrerPolicy="no-referrer"
    />
  );
}

function ListRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-6">
          <Skeleton className="h-14 w-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [dragDropEnabled, setDragDropEnabled] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveBannerDrag | null>(null);
  const [draggingBannerId, setDraggingBannerId] = useState<number | null>(null);

  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const activeDragRef = useRef<ActiveBannerDrag | null>(null);
  const bannersRef = useRef(banners);

  useEffect(() => {
    activeDragRef.current = activeDrag;
  }, [activeDrag]);

  useEffect(() => {
    bannersRef.current = banners;
  }, [banners]);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannersService.getBanners();
      setBanners(sortBanners(data));
      setHasLoaded(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const toCreatePayload = (data: BannerFormData): CreateBannerInput => {
    if (!(data.image instanceof File)) {
      throw new Error("Banner image is required");
    }

    return {
      title: data.title.trim(),
      image: data.image,
      redirect_type: data.redirect_type,
      redirect_id: data.redirect_id,
      priority: getNextPriority(banners),
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
    const withPriorities = applySequentialPriorities(reordered);

    setReorderingId(activeId);
    try {
      await persistPriorityOrder(withPriorities, banners);
      setBanners(withPriorities);
      toast.success("Banner order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update banner order");
    } finally {
      setReorderingId(null);
    }
  };

  const moveBanner = async (bannerId: number, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((banner) => banner.id === bannerId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await applyReorder(reordered, bannerId);
  };

  const setRowRef = useCallback((bannerId: number, element: HTMLDivElement | null) => {
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

    const withPriorities = applySequentialPriorities(reordered);

    setReorderingId(drag.id);
    try {
      await persistPriorityOrder(withPriorities, currentBanners);
      setBanners(withPriorities);
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

  const handleCreate = async (data: BannerFormData) => {
    try {
      await bannersService.createBanner(toCreatePayload(data));
      toast.success("Banner created successfully");
      setCreateOpen(false);
      await fetchBanners();
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
      await fetchBanners();
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
      await fetchBanners();
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

  if (!hasLoaded && loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: `${basePath}/dashboard` },
            { label: title },
          ]}
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">
          Manage homepage banners. Use arrows or enable drag and drop to control display order.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4" />
              Banners ({loading ? "…" : banners.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {banners.length > 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant={dragDropEnabled ? "primary" : "outline"}
                  onClick={() => {
                    setDragDropEnabled((current) => !current);
                    setActiveDrag(null);
                    setDraggingBannerId(null);
                  }}
                  disabled={reorderingId !== null || draggingBannerId !== null}
                  aria-pressed={dragDropEnabled}
                >
                  <GripVertical className="h-4 w-4" />
                  Drag to Reorder
                </Button>
              ) : null}
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Banner
              </Button>
            </div>
          </div>
          {dragDropEnabled && banners.length > 1 ? (
            <p className="text-sm text-muted-foreground">
              Drag banners by the handle to change their order.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          {loading && banners.length === 0 ? (
            <div className="px-6 py-8">
              <ListRowsSkeleton />
            </div>
          ) : banners.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-8 w-8 text-muted-foreground" />}
              title="No banners yet"
              description="Create your first promotional banner for the marketplace."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Banner
                </Button>
              }
            />
          ) : (
            <div
              className={cn(
                "relative divide-y divide-border",
                draggingBannerId !== null && "select-none"
              )}
            >
              {loading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                  <Loader />
                </div>
              ) : null}

              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  ref={(element) => setRowRef(banner.id, element)}
                  style={getBannerDragStyle(banner.id, index, activeDrag)}
                  className={cn(
                    "relative flex flex-col gap-4 bg-card px-4 py-4 will-change-transform sm:flex-row sm:items-center sm:px-6",
                    dragDropEnabled && draggingBannerId === null && reorderingId === null && "hover:bg-muted/20",
                    activeDrag?.id === banner.id &&
                      "rounded-xl bg-card ring-1 ring-primary/20"
                  )}
                >
                  {dragDropEnabled ? (
                    <button
                      type="button"
                      onPointerDown={(event) => handleGripPointerDown(event, banner.id, index)}
                      disabled={reorderingId !== null || draggingBannerId !== null}
                      className={cn(
                        "flex h-10 w-8 shrink-0 touch-none items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors",
                        "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        draggingBannerId === banner.id && "cursor-grabbing border-primary/50 bg-primary/10 text-primary"
                      )}
                      aria-label={`Drag ${banner.title} to reorder`}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  ) : null}

                  <BannerImage image={banner.image} title={banner.title} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{banner.title}</p>
                      <Badge variant="outline">Position {index + 1}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {banner.redirect_type && banner.redirect_id
                        ? `Redirects to ${banner.redirect_type} #${banner.redirect_id}`
                        : "No redirect configured"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!dragDropEnabled ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === 0 || reorderingId !== null}
                          onClick={() => void moveBanner(banner.id, "up")}
                          aria-label={`Move ${banner.title} up`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === banners.length - 1 || reorderingId !== null}
                          onClick={() => void moveBanner(banner.id, "down")}
                          aria-label={`Move ${banner.title} down`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => void openEdit(banner)}
                      aria-label={`Edit ${banner.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteBanner(banner)}
                      aria-label={`Delete ${banner.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Banner"
        description="Create a new promotional banner with image and redirect target."
        icon={<Megaphone className="h-5 w-5" />}
        className="max-w-xl"
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
        className="max-w-xl"
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
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-border bg-muted/20 p-2 shadow-sm">
              {resolveMediaDisplayUrl(deleteBanner.image) ? (
                <img
                  src={resolveMediaDisplayUrl(deleteBanner.image)!}
                  alt={deleteBanner.title}
                  className="h-28 w-full rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl bg-muted/40">
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
