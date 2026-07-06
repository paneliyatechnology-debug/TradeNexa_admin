"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandForm } from "@/components/brands/brand-form";
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
import { brandsService } from "@/services/brands.service";
import type { PaginatedData } from "@/types/api";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "@/types/brand";
import type { BrandFormData } from "@/utils/validators";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { Award, ImageIcon, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface BrandManagementProps {
  title: string;
  basePath: string;
}

type PopularFilter = "all" | "popular" | "not_popular";

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

function toPopularParam(filter: PopularFilter): boolean | undefined {
  if (filter === "all") return undefined;
  return filter === "popular";
}

function BrandLogo({
  logo,
  name,
  size = "md",
}: {
  logo: string | null;
  name: string;
  size?: "md" | "lg";
}) {
  const src = resolveMediaDisplayUrl(logo);
  const isLarge = size === "lg";

  const frameClass = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-muted/30",
    isLarge
      ? "h-12 w-12 border-primary/10 shadow-sm ring-2 ring-primary/5 sm:h-14 sm:w-14 sm:rounded-xl sm:ring-0"
      : "h-14 w-14 rounded-xl border-border"
  );

  if (!src) {
    return (
      <div className={cn(frameClass, "text-muted-foreground")}>
        <ImageIcon className={cn(isLarge ? "h-5 w-5" : "h-5 w-5")} />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <img
        src={src}
        alt={name}
        className="h-full w-full object-contain p-1.5"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function BrandStatusBadge({ isPopular }: { isPopular: boolean }) {
  if (isPopular) {
    return (
      <Badge className="gap-1 border-0 bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-800 hover:bg-amber-500/12">
        <Star className="h-3 w-3 fill-current" />
        Popular
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-border/80 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
    >
      Standard
    </Badge>
  );
}

interface BrandListItemProps {
  brand: Brand;
  onEdit: () => void;
  onDelete: () => void;
}

function BrandListItem({ brand, onEdit, onDelete }: BrandListItemProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden transition-colors",
        "rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/15 p-3 shadow-sm",
        "sm:rounded-none sm:border-0 sm:border-b sm:border-border sm:bg-transparent sm:bg-none sm:p-0 sm:px-6 sm:py-4 sm:shadow-none",
        "sm:hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <BrandLogo logo={brand.logo} name={brand.name} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-tight sm:text-base">
                {brand.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                {brand.slug}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-background/80 shadow-sm"
                onClick={onEdit}
                aria-label={`Edit ${brand.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-background/80 text-destructive shadow-sm hover:text-destructive"
                onClick={onDelete}
                aria-label={`Delete ${brand.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <BrandStatusBadge isPopular={brand.is_popular} />
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={onEdit}
            aria-label={`Edit ${brand.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={onDelete}
            aria-label={`Delete ${brand.name}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function ListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-3 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border/60 p-3 sm:rounded-none sm:border-0 sm:border-b sm:px-6 sm:py-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BrandManagement({ title, basePath }: BrandManagementProps) {
  const [brands, setBrands] = useState<PaginatedData<Brand>>({
    results: [],
    pagination: defaultPagination,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [popularFilter, setPopularFilter] = useState<PopularFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const prevSearchRef = useRef("");

  const fetchBrands = useCallback(
    async (pageNum: number, filter: PopularFilter, searchQuery: string) => {
      setLoading(true);
      try {
        const data = await brandsService.getBrands({
          page: pageNum,
          limit,
          is_popular: toPopularParam(filter),
          search: searchQuery || undefined,
          sort_by: "name",
          sort_order: "asc",
        });
        setBrands(data);
        setHasLoaded(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load brands");
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
    void fetchBrands(page, popularFilter, search);
  }, [fetchBrands, page, popularFilter, search]);

  const toCreatePayload = (data: BrandFormData): CreateBrandInput => {
    if (!(data.logo instanceof File)) {
      throw new Error("Logo is required");
    }

    return {
      name: data.name.trim(),
      logo: data.logo,
      is_popular: data.is_popular,
    };
  };

  const toUpdatePayload = (data: BrandFormData): UpdateBrandInput => {
    if (!editBrand) {
      throw new Error("No brand selected for update");
    }

    return {
      name: data.name.trim(),
      logo: data.logo ?? null,
      clear_logo: data.clear_logo,
      is_popular: data.is_popular,
    };
  };

  const handleCreate = async (data: BrandFormData) => {
    try {
      await brandsService.createBrand(toCreatePayload(data));
      toast.success("Brand created successfully");
      setCreateOpen(false);
      setPage(1);
      await fetchBrands(1, popularFilter, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create brand");
    }
  };

  const handleUpdate = async (data: BrandFormData) => {
    if (!editBrand) return;

    try {
      await brandsService.updateBrand(editBrand.id, toUpdatePayload(data));
      toast.success("Brand updated successfully");
      setEditBrand(null);
      await fetchBrands(page, popularFilter, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update brand");
    }
  };

  const handleDelete = async () => {
    if (!deleteBrand) return;

    setDeleting(true);
    try {
      await brandsService.deleteBrand(deleteBrand.id);
      toast.success("Brand deleted successfully");
      setDeleteBrand(null);

      const nextPage =
        brands.results.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchBrands(nextPage, popularFilter, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = async (brand: Brand) => {
    setEditBrand(brand);
    setEditLoading(true);

    try {
      const detail = await brandsService.getBrand(brand.id);
      setEditBrand(detail);
    } catch (error) {
      setEditBrand(null);
      toast.error(error instanceof Error ? error.message : "Failed to load brand details");
    } finally {
      setEditLoading(false);
    }
  };

  if (!hasLoaded && loading) {
    return <DashboardSkeleton />;
  }

  const filterButtons: { value: PopularFilter; label: string; shortLabel: string }[] = [
    { value: "all", label: "All", shortLabel: "All" },
    { value: "popular", label: "Popular", shortLabel: "Popular" },
    { value: "not_popular", label: "Not Popular", shortLabel: "Other" },
  ];

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
        <p className="mt-1 hidden text-sm text-muted-foreground sm:block md:text-base">
          Manage marketplace brands, logos, and popular brand visibility.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 shrink-0" />
              Brands ({loading ? "…" : brands.pagination.total})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search brands..."
                className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-0.5 sm:hidden">
              {filterButtons.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPopularFilter(option.value);
                    setPage(1);
                  }}
                  className={cn(
                    "min-w-[4.5rem] flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all",
                    popularFilter === option.value
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>

            <div className="hidden gap-2 sm:flex sm:flex-wrap">
              {filterButtons.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={popularFilter === option.value ? "primary" : "outline"}
                  onClick={() => {
                    setPopularFilter(option.value);
                    setPage(1);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-muted/15 p-0 sm:bg-transparent">
          {loading && brands.results.length === 0 ? (
            <div className="px-3 py-6 sm:px-6 sm:py-8">
              <ListRowsSkeleton />
            </div>
          ) : brands.results.length === 0 ? (
            <EmptyState
              icon={<Award className="h-8 w-8 text-muted-foreground" />}
              title={search || popularFilter !== "all" ? "No brands found" : "No brands yet"}
              description={
                search || popularFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Create your first brand for the marketplace."
              }
              action={
                !search && popularFilter === "all" ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Brand
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="relative space-y-3 p-3 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
                {loading ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px] sm:rounded-none">
                    <Loader />
                  </div>
                ) : null}

                {brands.results.map((brand) => (
                  <BrandListItem
                    key={brand.id}
                    brand={brand}
                    onEdit={() => void openEdit(brand)}
                    onDelete={() => setDeleteBrand(brand)}
                  />
                ))}
              </div>

              <div className="border-t border-border px-3 py-3 sm:px-6 sm:py-4">
                <Pagination
                  pagination={brands.pagination}
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
        title="Add Brand"
        description="Create a new brand with logo and popularity settings."
        icon={<Award className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        <BrandForm
          key={createOpen ? "create-brand-open" : "create-brand-closed"}
          formKey={createOpen ? "create-brand-open" : "create-brand-closed"}
          submitLabel="Create Brand"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editBrand}
        onClose={() => !editLoading && setEditBrand(null)}
        title="Edit Brand"
        description="Update brand name, logo, and popularity."
        icon={<Pencil className="h-5 w-5" />}
        className="w-full max-w-xl"
      >
        {editBrand &&
          (editLoading ? (
            <div className="flex justify-center px-5 py-10 sm:px-6">
              <Loader size="lg" />
            </div>
          ) : (
            <BrandForm
              key={`edit-brand-${editBrand.id}`}
              formKey={`edit-brand-${editBrand.id}`}
              mode="edit"
              submitLabel="Save Changes"
              initialValues={{
                name: editBrand.name,
                is_popular: editBrand.is_popular,
                logoUrl: editBrand.logo,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditBrand(null)}
            />
          ))}
      </Modal>

      <ConfirmDialog
        open={!!deleteBrand}
        onClose={() => !deleting && setDeleteBrand(null)}
        onConfirm={handleDelete}
        title="Delete this brand?"
        loading={deleting}
        confirmLabel="Delete Brand"
        icon={<Trash2 className="h-7 w-7" />}
        preview={
          deleteBrand ? (
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-border bg-muted/20 p-4 shadow-sm">
              <div className="flex items-center justify-center">
                <BrandLogo logo={deleteBrand.logo} name={deleteBrand.name} />
              </div>
              <p className="mt-3 truncate text-center text-sm font-medium text-foreground">
                {deleteBrand.name}
              </p>
            </div>
          ) : null
        }
        description={
          <>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">
              &ldquo;{deleteBrand?.name}&rdquo;
            </span>{" "}
            from your marketplace brands. This action cannot be undone.
          </>
        }
      />
    </div>
  );
}
