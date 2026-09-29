"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { BusinessTypeForm } from "@/components/business-types/business-type-form";
import { businessTypesService } from "@/services/business-types.service";
import type { PaginatedData, SortOrder } from "@/types/api";
import type {
  AppRole,
  BusinessType,
  BusinessTypeSortBy,
  CreateBusinessTypeInput,
  UpdateBusinessTypeInput,
} from "@/types/business-type";
import { Briefcase, Pencil, Plus, Trash2, Users, Building2, Store } from "lucide-react";
import { cn } from "@/utils/cn";
import { getColumnDefaultOrder, nextColumnSortState } from "@/utils/column-sort";

const SORTABLE_COLUMNS: {
  column: BusinessTypeSortBy;
  defaultOrder: SortOrder;
}[] = [
  { column: "id", defaultOrder: "asc" },
  { column: "name", defaultOrder: "asc" },
  { column: "code", defaultOrder: "asc" },
  { column: "created_at", defaultOrder: "desc" },
];

function getDefaultSortOrder(column: BusinessTypeSortBy): SortOrder {
  return getColumnDefaultOrder(column, SORTABLE_COLUMNS);
}

interface BusinessTypeManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

function StatusBadge({ isActive }: { isActive: boolean | number }) {
  const active = Boolean(isActive);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ roleName }: { roleName?: string }) {
  const name = roleName || "All Roles";
  const isSeller = name.toLowerCase().includes("seller");
  const isBuyer = name.toLowerCase().includes("buyer");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border",
        isSeller && isBuyer
          ? "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : isSeller
          ? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      )}
    >
      <Users className="h-3 w-3 opacity-70" />
      {name}
    </span>
  );
}

export function BusinessTypeManagement({ title, basePath }: BusinessTypeManagementProps) {
  const [data, setData] = useState<PaginatedData<BusinessType>>({
    results: [],
    pagination: defaultPagination,
  });
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "all">("all");
  const [activeFilter, setActiveFilter] = useState<BoolFilterValue>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<BusinessTypeSortBy | null>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Dialog & Bulk States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessType | null>(null);
  const [deletingItem, setDeletingItem] = useState<BusinessType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Load Roles for filter dropdown and form select (only Buyer, Seller, Buyer+Seller)
  const loadRoles = useCallback(async () => {
    try {
      const res = await businessTypesService.getRoles();
      const allRoles = res.results || [];
      const allowedRoles = allRoles.filter((r) =>
        ["buyer", "seller", "buyer_seller"].includes(r.code?.toLowerCase())
      );
      setRoles(
        allowedRoles.length
          ? allowedRoles
          : [
              { id: 1, name: "Buyer", code: "buyer", is_active: 1 },
              { id: 2, name: "Seller", code: "seller", is_active: 1 },
              { id: 3, name: "Buyer + Seller", code: "buyer_seller", is_active: 1 },
            ]
      );
    } catch {
      // Fallback standard roles
      setRoles([
        { id: 1, name: "Buyer", code: "buyer", is_active: 1 },
        { id: 2, name: "Seller", code: "seller", is_active: 1 },
        { id: 3, name: "Buyer + Seller", code: "buyer_seller", is_active: 1 },
      ]);
    }
  }, []);

  // Fetch Business Types
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setIsUpdating(true);

      try {
        const result = await businessTypesService.getBusinessTypes({
          page,
          limit,
          search: search.trim() || undefined,
          role_id: roleFilter === "all" ? undefined : roleFilter,
          is_active: activeFilter === "all" ? undefined : activeFilter === "yes",
          sort_by: sortBy || undefined,
          sort_order: sortOrder,
        });
        if (result && Array.isArray(result.results)) {
          setData({
            results: result.results,
            pagination: result.pagination || defaultPagination,
          });
        } else if (Array.isArray(result)) {
          const arr = result as BusinessType[];
          setData({
            results: arr,
            pagination: {
              total: arr.length,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          });
        } else {
          setData({
            results: [],
            pagination: defaultPagination,
          });
        }
      } catch (err) {
        toast.error("Failed to load business types");
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    },
    [page, limit, search, roleFilter, activeFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column: BusinessTypeSortBy) => {
    const next = nextColumnSortState<BusinessTypeSortBy>({
      column,
      sortBy,
      sortOrder,
      defaultOrder: getDefaultSortOrder(column),
    });
    setSortBy(next.sortBy);
    setSortOrder(next.sortOrder);
  };

  const handleCreate = async (formData: CreateBusinessTypeInput | UpdateBusinessTypeInput) => {
    try {
      await businessTypesService.createBusinessType(formData as CreateBusinessTypeInput);
      toast.success("Business type created successfully");
      setIsCreateOpen(false);
      fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create business type";
      toast.error(message);
      throw err;
    }
  };

  const handleUpdate = async (formData: CreateBusinessTypeInput | UpdateBusinessTypeInput) => {
    if (!editingItem) return;
    try {
      await businessTypesService.updateBusinessType(editingItem.id, formData as UpdateBusinessTypeInput);
      toast.success("Business type updated successfully");
      setEditingItem(null);
      fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update business type";
      toast.error(message);
      throw err;
    }
  };

  const isAllPageSelected =
    data.results.length > 0 &&
    data.results.every((item) => selectedIds.includes(item.id));
  const isSomePageSelected =
    data.results.some((item) => selectedIds.includes(item.id)) && !isAllPageSelected;

  const handleToggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIdSet = new Set(data.results.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...data.results.map((i) => i.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const newIds = new Set([...selectedIds, ...data.results.map((i) => i.id)]);
    setSelectedIds(Array.from(newIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await businessTypesService.deleteBusinessType(deletingItem.id);
      toast.success("Business type deleted successfully");
      setSelectedIds((prev) => prev.filter((id) => id !== deletingItem.id));
      setDeletingItem(null);
      fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete business type";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await businessTypesService.bulkDeleteBusinessTypes(selectedIds);
      toast.success(`${selectedIds.length} business type(s) deleted successfully`);
      setSelectedIds([]);
      setIsDeleteSelectedOpen(false);
      fetchData(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete selected business types";
      toast.error(message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsBulkDeleting(true);
    try {
      await businessTypesService.deleteAllBusinessTypes();
      toast.success("All business types deleted successfully");
      setSelectedIds([]);
      setIsDeleteAllOpen(false);
      fetchData(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete all business types";
      toast.error(message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (loading && !data.results.length) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: `${basePath}/dashboard` },
              { label: title },
            ]}
          />
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage business categories and classifications assigned to Buyers and Sellers during registration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data.pagination.total > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllOpen(true)}
              className="shrink-0 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          )}
          <Button onClick={() => setIsCreateOpen(true)} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            Add Business Type
          </Button>
        </div>
      </div>

      {/* Floating / Active Selection Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm dark:bg-primary/10">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {selectedIds.length}
            </span>
            <span className="font-medium text-foreground">
              {selectedIds.length} business type(s) selected
            </span>
            {selectedIds.length < data.results.length && (
              <button
                type="button"
                onClick={handleSelectAllOnPage}
                className="ml-2 text-xs font-medium text-primary underline underline-offset-2 hover:opacity-80"
              >
                Select all on this page ({data.results.length})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteSelectedOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Main Filter & Table Card */}
      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="w-full lg:max-w-xs">
              <SearchField
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Role & Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value === "all" ? "all" : Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <BoolFilterGroup
                  label="Status"
                  value={activeFilter}
                  onChange={(val) => {
                    setActiveFilter(val);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <TableLoadingOverlay loading={isUpdating}>
            <DataTable>
              <thead>
                <TableHeadRow>
                  <TableHeadCell className="w-12 px-3">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomePageSelected;
                      }}
                      disabled={data.results.length === 0}
                      onChange={handleToggleSelectAllPage}
                      aria-label="Select all business types on this page"
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                  </TableHeadCell>
                  <SortableTableHead
                    label="ID"
                    column="id"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-16"
                  />
                  <SortableTableHead
                    label="Name"
                    column="name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    label="Code"
                    column="code"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <TableHeadCell>Assigned Role</TableHeadCell>
                  <TableHeadCell align="center">Status</TableHeadCell>
                  <SortableTableHead
                    label="Created At"
                    column="created_at"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <TableHeadCell align="right">Actions</TableHeadCell>
                </TableHeadRow>
              </thead>

              <TableBody>
                {data.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <EmptyState
                        icon={<Briefcase className="h-5 w-5" />}
                        title="No business types found"
                        description={
                          search || roleFilter !== "all" || activeFilter !== "all"
                            ? "Try clearing or changing your filters to see more results."
                            : "Get started by adding your first business type."
                        }
                        action={
                          search || roleFilter !== "all" || activeFilter !== "all" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearch("");
                                setRoleFilter("all");
                                setActiveFilter("all");
                                setPage(1);
                              }}
                            >
                              Reset Filters
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add Business Type
                            </Button>
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data.results.map((item, index) => {
                    const zeroBasedId = (page - 1) * limit + index;
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <TableRow
                        key={item.id}
                        className={cn(isSelected && "bg-primary/5 dark:bg-primary/10")}
                      >
                        <TableCell className="w-12 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(item.id)}
                            aria-label={`Select ${item.name}`}
                            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="w-16">
                          <span
                            className="inline-flex items-center justify-center rounded bg-muted/70 px-2 py-0.5 font-mono text-xs font-semibold text-foreground"
                            title={`0-Based Index: ${zeroBasedId} | Database ID: #${item.id}`}
                          >
                            {item.id !== undefined && item.id !== null ? item.id : zeroBasedId}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" />
                            </span>
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.code || "—"}
                        </TableCell>
                        <TableCell>
                          <RoleBadge roleName={item.role_name} />
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge isActive={item.is_active} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1.5">
                            <IconButton
                              label="Edit business type"
                              tone="view"
                              onClick={() => setEditingItem(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </IconButton>
                            <IconButton
                              label="Delete business type"
                              tone="danger"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </DataTable>
          </TableLoadingOverlay>

          {/* Pagination Footer */}
          {data.pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <Pagination
                pagination={data.pagination}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Business Type"
        description="Create a new business classification assigned to Buyers and Sellers."
        icon={<Briefcase className="h-5 w-5" />}
        className="w-full max-w-2xl"
      >
        <BusinessTypeForm
          submitLabel="Create Business Type"
          roles={roles}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Business Type"
        description="Update business type name, assigned role, code, or active status."
        icon={<Pencil className="h-5 w-5" />}
        className="w-full max-w-2xl"
      >
        {editingItem && (
          <BusinessTypeForm
            submitLabel="Save Changes"
            roles={roles}
            mode="edit"
            initialValues={{
              name: editingItem.name,
              code: editingItem.code,
              role_id: editingItem.role_id,
              is_active: Boolean(editingItem.is_active),
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Delete Business Type"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action will remove the business type.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />

      {/* Delete Selected Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteSelectedOpen}
        onClose={() => setIsDeleteSelectedOpen(false)}
        title={`Delete ${selectedIds.length} Selected Business Types`}
        description={`Are you sure you want to delete ${selectedIds.length} selected business type(s)? This action will remove the selected business types.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        variant="destructive"
        loading={isBulkDeleting}
        onConfirm={handleDeleteSelected}
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        title="Delete All Business Types"
        description={`Are you sure you want to delete all ${data.pagination.total} business types? This action will completely remove all business types from the database.`}
        confirmLabel="Delete All"
        variant="destructive"
        loading={isBulkDeleting}
        onConfirm={handleDeleteAll}
      />
    </div>
  );
}
