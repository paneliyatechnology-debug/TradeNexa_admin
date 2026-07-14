"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandForm } from "@/components/brands/brand-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { BoolFilterGroup, type BoolFilterValue } from "@/components/ui/filter-chips";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { brandsService } from "@/services/brands.service";
import type { PaginatedData, SortOrder } from "@/types/api";
import type { Brand, BrandSortBy, CreateBrandInput, UpdateBrandInput } from "@/types/brand";
import type { BrandFormData } from "@/utils/validators";
import { resolveMediaDisplayUrl } from "@/utils/media-url";
import { Award, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { getColumnDefaultOrder, nextColumnSortState } from "@/utils/column-sort";

const SORTABLE_COLUMNS: {
  column: BrandSortBy;
  defaultOrder: SortOrder;
}[] = [
  { column: "name", defaultOrder: "asc" },
  { column: "country", defaultOrder: "asc" },
];

function getDefaultSortOrder(column: BrandSortBy): SortOrder {
  return getColumnDefaultOrder(column, SORTABLE_COLUMNS);
}

interface BrandManagementProps {
  title: string;
  basePath: string;
}

type BoolFilter = BoolFilterValue;

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

function toBoolParam(filter: BoolFilter): boolean | undefined {
  if (filter === "all") return undefined;
  return filter === "yes";
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
    <TableHeadRow>
      <TableHeadCell>Logo</TableHeadCell>
      <SortableTableHead
        label="Name"
        column="name"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <SortableTableHead
        label="Country"
        column="country"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <TableHeadCell>Website</TableHeadCell>
      <TableHeadCell align="center">Active</TableHeadCell>
      <TableHeadCell align="center">Popular</TableHeadCell>
      <TableHeadCell align="center">Featured</TableHeadCell>
      <TableHeadCell align="right">Actions</TableHeadCell>
    </TableHeadRow>
  );
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
    "flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40",
    isLarge ? "h-14 w-14 ring-2 ring-primary/5" : "h-10 w-10"
  );

  if (!src) {
    return (
      <div className={cn(frameClass, "border-dashed border-border text-muted-foreground")}>
        <ImageIcon className={cn(isLarge ? "h-5 w-5" : "h-4 w-4")} />
      </div>
    );
  }

  return (
    <div className={cn(frameClass, "border-border")}>
      <img
        src={src}
        alt={name}
        className="h-full w-full object-contain p-1.5"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function YesNoValue({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        "text-sm font-medium",
        value ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {value ? "Yes" : "No"}
    </span>
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
  const country = brand.country?.trim();
  const website = brand.website?.trim();

  return (
    <TableRow>
      <TableCell>
        <BrandLogo logo={brand.logo} name={brand.name} />
      </TableCell>
      <TableCell>
        <p className="max-w-[12rem] truncate font-semibold leading-snug sm:max-w-xs">
          {brand.name}
        </p>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <p className="max-w-[10rem] truncate sm:max-w-xs">{country || "—"}</p>
      </TableCell>
      <TableCell>
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-[12rem] truncate text-sm text-primary hover:underline sm:max-w-xs"
          >
            {website.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell align="center">
        <YesNoValue value={brand.is_active} />
      </TableCell>
      <TableCell align="center">
        <YesNoValue value={brand.is_popular} />
      </TableCell>
      <TableCell align="center">
        <YesNoValue value={brand.is_featured} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          <IconButton label="Edit brand" tone="view" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Delete brand" tone="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

function BrandTableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-10 w-10 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell align="center">
            <Skeleton className="mx-auto h-4 w-8" />
          </TableCell>
          <TableCell align="center">
            <Skeleton className="mx-auto h-4 w-8" />
          </TableCell>
          <TableCell align="center">
            <Skeleton className="mx-auto h-4 w-8" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
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
  const [activeFilter, setActiveFilter] = useState<BoolFilter>("all");
  const [popularFilter, setPopularFilter] = useState<BoolFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<BoolFilter>("all");
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
        is_active: toBoolParam(activeFilter),
        is_popular: toBoolParam(popularFilter),
        is_featured: toBoolParam(featuredFilter),
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
  }, [page, limit, activeFilter, popularFilter, featuredFilter, search, sortBy, sortOrder]);

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
      defaultOrder: getDefaultSortOrder(column),
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
      description: data.description.trim(),
      country: data.country.trim(),
      website: data.website.trim(),
      is_popular: data.is_popular,
      is_active: data.is_active,
      is_featured: data.is_featured,
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
      description: data.description.trim(),
      country: data.country.trim(),
      website: data.website.trim(),
      is_popular: data.is_popular,
      is_active: data.is_active,
      is_featured: data.is_featured,
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

  const handleBoolFilterChange = (
    setter: (value: BoolFilter) => void,
    value: BoolFilter
  ) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    activeFilter !== "all" ||
    popularFilter !== "all" ||
    featuredFilter !== "all";

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
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 md:text-2xl">{title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Add and organize brands with logos to create trusted marketplace listings.
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

          <div className="flex flex-col gap-3">
            <SearchField
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search brands..."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <BoolFilterGroup
                label="Active"
                value={activeFilter}
                onChange={(value) => handleBoolFilterChange(setActiveFilter, value)}
              />
              <BoolFilterGroup
                label="Popular"
                value={popularFilter}
                onChange={(value) => handleBoolFilterChange(setPopularFilter, value)}
              />
              <BoolFilterGroup
                label="Featured"
                value={featuredFilter}
                onChange={(value) => handleBoolFilterChange(setFeaturedFilter, value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && brands.results.length === 0 ? (
            <div className="px-4 py-4 sm:px-0">
              <DataTable minWidthClassName="min-w-[56rem]">
                <thead>
                  <BrandTableHeader
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleColumnSort}
                  />
                </thead>
                <TableBody>
                  <BrandTableRowsSkeleton />
                </TableBody>
              </DataTable>
            </div>
          ) : brands.results.length === 0 ? (
            <EmptyState
              icon={<Award className="h-8 w-8 text-muted-foreground" />}
              title={hasActiveFilters ? "No brands found" : "No brands yet"}
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first brand for the marketplace."
              }
              action={
                !hasActiveFilters ? (
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
                <DataTable minWidthClassName="min-w-[56rem]">
                  <thead>
                    <BrandTableHeader
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleColumnSort}
                    />
                  </thead>
                  <TableBody>
                    {brands.results.map((brand) => (
                      <BrandTableRow
                        key={brand.id}
                        brand={brand}
                        onEdit={() => void openEdit(brand)}
                        onDelete={() => setDeleteBrand(brand)}
                      />
                    ))}
                  </TableBody>
                </DataTable>
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
        description="Create a new brand with logo, details, and visibility settings."
        icon={<Award className="h-5 w-5" />}
        className="w-full max-w-2xl"
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
        description="Update brand details, logo, and visibility settings."
        icon={<Pencil className="h-5 w-5" />}
        className="w-full max-w-2xl"
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
                description: editBrand.description ?? "",
                country: editBrand.country ?? "",
                website: editBrand.website ?? "",
                is_popular: editBrand.is_popular,
                is_active: editBrand.is_active,
                is_featured: editBrand.is_featured,
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
            <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-center">
                <BrandLogo logo={deleteBrand.logo} name={deleteBrand.name} size="lg" />
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
