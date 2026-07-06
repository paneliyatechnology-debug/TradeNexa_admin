"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { OfferForm } from "@/components/offers/offer-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { offersService } from "@/services/offers.service";
import type { PaginatedData } from "@/types/api";
import type { CreateOfferInput, Offer, UpdateOfferInput } from "@/types/offer";
import {
  formatExpiryDateForApi,
  formatExpiryDateLabel,
} from "@/types/offer";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { cn } from "@/utils/cn";
import type { OfferFormData } from "@/utils/validators";
import { ImageIcon, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";

interface OfferManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

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

function OfferBannerThumb({
  banner,
  label,
}: {
  banner: string | null;
  label: string;
}) {
  const src = resolveMediaDisplayUrl(banner);

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
      alt={label}
      className="h-14 w-20 shrink-0 rounded-lg border border-border bg-background object-cover"
      referrerPolicy="no-referrer"
    />
  );
}

function OfferTableRow({
  offer,
  onEdit,
  onDelete,
}: {
  offer: Offer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const expiryLabel = formatExpiryDateLabel(offer.expiry_date);
  const displayTitle = offer.title?.trim() || `Offer #${offer.id}`;
  const isExpired = offer.expiry_date
    ? new Date(offer.expiry_date).getTime() < Date.now()
    : false;

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 sm:px-6">
        <OfferBannerThumb banner={offer.banner} label={displayTitle} />
      </td>
      <td className="px-4 py-3 sm:px-6">
        <p className="max-w-[14rem] font-medium leading-snug sm:max-w-xs">{displayTitle}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">ID #{offer.id}</p>
      </td>
      <td className="px-4 py-3 sm:px-6">
        <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
          {offer.discount}% off
        </Badge>
      </td>
      <td className="px-4 py-3 sm:px-6">
        {expiryLabel ? (
          <div className="min-w-[7.5rem]">
            <p
              className={cn(
                "text-sm",
                isExpired ? "font-medium text-destructive" : "text-foreground"
              )}
            >
              {expiryLabel}
            </p>
            {isExpired ? (
              <Badge variant="danger" className="mt-1 text-[10px]">
                Expired
              </Badge>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">Active</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onEdit}
            aria-label={`Edit ${displayTitle}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onDelete}
            aria-label={`Delete ${displayTitle}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-14 w-20 rounded-lg" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-14" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-6 w-16 rounded-full" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-12" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function OfferManagement({ title, basePath }: OfferManagementProps) {
  const [offers, setOffers] = useState<PaginatedData<Offer>>({
    results: [],
    pagination: defaultPagination,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const prevSearchRef = useRef("");

  const fetchOffers = useCallback(
    async (pageNum: number, searchQuery: string) => {
      setLoading(true);
      try {
        const data = await offersService.getOffers({
          page: pageNum,
          limit,
          search: searchQuery || undefined,
          sort_by: "id",
          sort_order: "desc",
        });
        setOffers(data);
        setHasLoaded(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load offers");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

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
    void fetchOffers(page, search);
  }, [fetchOffers, page, search]);

  const toCreatePayload = (data: OfferFormData): CreateOfferInput => ({
    title: data.title.trim(),
    banner: data.banner instanceof File ? data.banner : null,
    discount: data.discount,
    expiry_date: formatExpiryDateForApi(data.expiry_date),
  });

  const toUpdatePayload = (data: OfferFormData): UpdateOfferInput => ({
    title: data.title.trim(),
    banner: data.banner ?? null,
    clear_banner: data.clear_banner,
    discount: data.discount,
    expiry_date: formatExpiryDateForApi(data.expiry_date),
  });

  const handleCreate = async (data: OfferFormData) => {
    try {
      await offersService.createOffer(toCreatePayload(data));
      toast.success("Offer created successfully");
      setCreateOpen(false);
      setPage(1);
      await fetchOffers(1, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create offer");
    }
  };

  const handleUpdate = async (data: OfferFormData) => {
    if (!editOffer) return;

    try {
      await offersService.updateOffer(editOffer.id, toUpdatePayload(data));
      toast.success("Offer updated successfully");
      setEditOffer(null);
      await fetchOffers(page, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update offer");
    }
  };

  const handleDelete = async () => {
    if (!deleteOffer) return;

    setDeleting(true);
    try {
      await offersService.deleteOffer(deleteOffer.id);
      toast.success("Offer deleted successfully");
      setDeleteOffer(null);

      const nextPage = offers.results.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchOffers(nextPage, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete offer");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = async (offer: Offer) => {
    setEditOffer(offer);
    setEditLoading(true);

    try {
      const detail = await offersService.getOffer(offer.id);
      setEditOffer(detail);
    } catch (error) {
      setEditOffer(null);
      toast.error(error instanceof Error ? error.message : "Failed to load offer details");
    } finally {
      setEditLoading(false);
    }
  };

  if (!hasLoaded && loading) {
    return <DashboardSkeleton />;
  }

  const deleteTitle = deleteOffer?.title?.trim() || `Offer #${deleteOffer?.id}`;

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
        <h1 className="text-xl font-bold tracking-tight sm:mt-2 md:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Manage promotional offers displayed in the marketplace.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4 shrink-0" />
              Offers ({loading ? "…" : offers.pagination.total})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Offer
            </Button>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search offers..."
              className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && offers.results.length === 0 ? (
            <div className="overflow-x-auto px-4 py-4 sm:px-0">
              <table className="w-full min-w-[44rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium sm:px-6">Banner</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6">Title</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6">Discount</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6">Expiry Date</th>
                    <th className="px-4 py-3 text-left font-medium sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <TableRowsSkeleton />
                </tbody>
              </table>
            </div>
          ) : offers.results.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-8 w-8 text-muted-foreground" />}
              title={search ? "No offers found" : "No offers yet"}
              description={
                search
                  ? "Try adjusting your search."
                  : "Create your first promotional offer."
              }
              action={
                !search ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Offer
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <TableLoadingOverlay loading={loading}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[44rem] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Banner</th>
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Title</th>
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Discount</th>
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Expiry Date</th>
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {offers.results.map((offer) => (
                        <OfferTableRow
                          key={offer.id}
                          offer={offer}
                          onEdit={() => void openEdit(offer)}
                          onDelete={() => setDeleteOffer(offer)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </TableLoadingOverlay>

              <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
                <Pagination
                  pagination={offers.pagination}
                  onPageChange={setPage}
                  className="pt-0"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Offer"
        description="Create a promotional offer with title, discount, expiry, and banner."
        icon={<Tag className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        <OfferForm
          key={createOpen ? "create-offer-open" : "create-offer-closed"}
          formKey={createOpen ? "create-offer-open" : "create-offer-closed"}
          submitLabel="Create Offer"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editOffer}
        onClose={() => !editLoading && setEditOffer(null)}
        title="Edit Offer"
        description="Update offer details and banner image."
        icon={<Pencil className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        {editOffer &&
          (editLoading ? (
            <div className="flex justify-center px-5 py-10 sm:px-6">
              <Loader size="lg" />
            </div>
          ) : (
            <OfferForm
              key={`edit-offer-${editOffer.id}`}
              formKey={`edit-offer-${editOffer.id}`}
              mode="edit"
              submitLabel="Save Changes"
              initialValues={{
                title: editOffer.title,
                discount: editOffer.discount,
                expiry_date: editOffer.expiry_date,
                bannerUrl: editOffer.banner,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditOffer(null)}
            />
          ))}
      </Modal>

      <ConfirmDialog
        open={!!deleteOffer}
        onClose={() => !deleting && setDeleteOffer(null)}
        onConfirm={handleDelete}
        title="Delete this offer?"
        loading={deleting}
        confirmLabel="Delete Offer"
        icon={<Trash2 className="h-7 w-7" />}
        preview={
          deleteOffer ? (
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-border bg-muted/20 p-2 shadow-sm">
              {resolveMediaDisplayUrl(deleteOffer.banner) ? (
                <img
                  src={resolveMediaDisplayUrl(deleteOffer.banner)!}
                  alt={deleteTitle}
                  className="h-28 w-full rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl bg-muted/40">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <p className="mt-2 truncate px-1 text-center text-sm font-medium text-foreground">
                {deleteTitle}
              </p>
            </div>
          ) : null
        }
        description={
          <>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">&ldquo;{deleteTitle}&rdquo;</span>{" "}
            from your marketplace offers. This action cannot be undone.
          </>
        }
      />
    </div>
  );
}
