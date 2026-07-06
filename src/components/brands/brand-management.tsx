"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
import type { PaginatedData, SortOrder } from "@/types/api";
import type { Brand, BrandSortBy, CreateBrandInput, UpdateBrandInput } from "@/types/brand";
import type { BrandFormData } from "@/utils/validators";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { nextColumnSortState } from "@/utils/column-sort";

const NAME_DEFAULT_SORT_ORDER: SortOrder = "asc";

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

function SortableColumnHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: BrandSortBy;
  sortBy: BrandSortBy | null;
  sortOrder: SortOrder;
  onSort: (column: BrandSortBy) => void;
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
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
        )}
      </button>
    </th>
  );
}

function BrandTableHeader({
  sortBy,
  sortOrder,
  onSort,
}: {
  sortBy: BrandSortBy | null;
  sortOrder: SortOrder;
  onSort: (column: BrandSortBy) => void;
}) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="px-4 py-3 text-left font-medium sm:px-6">Logo</th>
        <SortableColumnHeader
          label="Name"
          column="name"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <th className="px-4 py-3 text-left font-medium sm:px-6">Created</th>
        <th className="px-4 py-3 text-left font-medium sm:px-6">Popular</th>
        <th className="px-4 py-3 text-left font-medium sm:px-6">Actions</th>
      </tr>
    </thead>
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

function BrandLogo({
  logo,
  name,
}: {
  logo: string | null;
  name: string;
}) {
  const src = resolveMediaDisplayUrl(logo);

  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-12 w-12 shrink-0 rounded-lg border border-border bg-background object-contain p-1"
      referrerPolicy="no-referrer"
    />
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

function BrandTableRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand: Brand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const createdLabel = formatCreatedLabel(brand.created_at);

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 sm:px-6">
        <BrandLogo logo={brand.logo} name={brand.name} />
      </td>
      <td className="px-4 py-3 sm:px-6">
        <p className="max-w-[14rem] font-medium leading-snug sm:max-w-xs">{brand.name}</p>
      </td>
      <td className="px-4 py-3 text-muted-foreground sm:px-6">
        {createdLabel ?? "—"}
      </td>
      <td className="px-4 py-3 sm:px-6">
        <BrandStatusBadge isPopular={brand.is_popular} />
      </td>
      <td className="px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onEdit}
            aria-label={`Edit ${brand.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onDelete}
            aria-label={`Delete ${brand.name}`}
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
        <tr key={index} className="border-b border-border">
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-12 w-12 rounded-lg" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-4 py-3 sm:px-6">
            <Skeleton className="h-5 w-16 rounded-full" />
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
  const [sortBy, setSortBy] = useState<BrandSortBy | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const prevSearchRef = useRef("");

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandsService.getBrands({
        page,
        limit,
        is_popular: toPopularParam(popularFilter),
        search: search || undefined,
        sort_by: sortBy ?? undefined,
        sort_order: sortBy ? sortOrder : undefined,
      });
      setBrands(data);
      setHasLoaded(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [page, limit, popularFilter, search, sortBy, sortOrder]);

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
    void fetchBrands();
  }, [fetchBrands]);

  const handleColumnSort = (column: BrandSortBy) => {
    setPage(1);

    const next = nextColumnSortState({
      column,
      sortBy,
      sortOrder,
      defaultOrder: NAME_DEFAULT_SORT_ORDER,
    });
    setSortBy(next.sortBy);
    setSortOrder(next.sortOrder);
  };

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
      await fetchBrands();
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
      await fetchBrands();
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

      const nextPage = brands.results.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchBrands();
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

        <CardContent className="p-0">
          {loading && brands.results.length === 0 ? (
            <div className="overflow-x-auto px-4 py-4 sm:px-0">
              <table className="w-full min-w-[48rem] text-sm">
                <BrandTableHeader
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleColumnSort}
                />
                <tbody className="divide-y divide-border">
                  <TableRowsSkeleton />
                </tbody>
              </table>
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
              <TableLoadingOverlay loading={loading}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[48rem] text-sm">
                    <BrandTableHeader
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleColumnSort}
                />
                    <tbody className="divide-y divide-border">
                      {brands.results.map((brand) => (
                        <BrandTableRow
                          key={brand.id}
                          brand={brand}
                          onEdit={() => void openEdit(brand)}
                          onDelete={() => setDeleteBrand(brand)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </TableLoadingOverlay>

              <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
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
