"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateCategoryForm } from "@/components/categories/create-category-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { PaginatedData } from "@/types/api";
import type { Category, Subcategory } from "@/types/category";
import type { Product } from "@/types/product";
import type { CreateCategoryFormData } from "@/utils/validators";
import { cn } from "@/utils/cn";
import {
  ChevronRight,
  FolderTree,
  Layers,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

type View = "categories" | "subcategories" | "products";

type DeleteTarget =
  | { type: "category"; item: Category }
  | { type: "subcategory"; item: Subcategory };

type ActiveFilter = "all" | "active" | "inactive";

function toIsActiveParam(filter: ActiveFilter): boolean | undefined {
  if (filter === "all") return undefined;
  return filter === "active";
}

interface CategoryManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export function CategoryManagement({ title, basePath }: CategoryManagementProps) {
  const [view, setView] = useState<View>("categories");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createSubcategoryOpen, setCreateSubcategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSubcategory, setEditSubcategory] = useState<Subcategory | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [categories, setCategories] = useState<PaginatedData<Category>>({
    results: [],
    pagination: defaultPagination,
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<PaginatedData<Product>>({
    results: [],
    pagination: defaultPagination,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(
    null
  );

  const fetchCategories = useCallback(
    async (pageNum: number, filter: ActiveFilter) => {
      setLoading(true);
      try {
        const data = await categoriesService.getCategories({
          page: pageNum,
          limit,
          is_active: toIsActiveParam(filter),
        });
        setCategories(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const fetchCategoryDetail = useCallback(async (categoryId: number) => {
    setLoading(true);
    try {
      const detail = await categoriesService.getCategory(categoryId);
      setSelectedCategory({
        id: detail.id,
        name: detail.name,
        icon: detail.icon,
        image: detail.image,
        slug: detail.slug,
        is_active: detail.is_active,
        subcategory_count: detail.subcategories.length,
        product_count: 0,
      });
      setSubcategories(detail.subcategories);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load category details"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(
    async (subcategoryId: number, pageNum: number) => {
      setLoading(true);
      try {
        const data = await productsService.getProducts({
          page: pageNum,
          limit,
          subcategory_id: subcategoryId,
        });
        setProducts(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    if (view === "categories") {
      fetchCategories(page, activeFilter);
    }
  }, [view, page, activeFilter, fetchCategories]);

  const filteredSubcategories = useMemo(() => {
    if (activeFilter === "all") return subcategories;
    if (activeFilter === "active") {
      return subcategories.filter((subcategory) => subcategory.is_active);
    }
    return subcategories.filter((subcategory) => !subcategory.is_active);
  }, [subcategories, activeFilter]);

  const handleActiveFilterChange = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  useEffect(() => {
    if (view === "subcategories" && selectedCategory) {
      void fetchCategoryDetail(selectedCategory.id);
    }
  }, [view, selectedCategory?.id, fetchCategoryDetail]);

  useEffect(() => {
    if (view === "products" && selectedSubcategory) {
      fetchProducts(selectedSubcategory.id, page);
    }
  }, [view, page, selectedSubcategory, fetchProducts]);

  const openCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setPage(1);
    setView("subcategories");
  };

  const openSubcategory = async (subcategory: Subcategory) => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const detail = await categoriesService.getSubcategory(
        selectedCategory.id,
        subcategory.id
      );
      setSelectedSubcategory({
        id: detail.id,
        parent_id: detail.parent_id,
        name: detail.name,
        icon: detail.icon,
        image: detail.image,
        slug: detail.slug,
        is_active: detail.is_active,
        product_count: subcategory.product_count ?? 0,
      });
      setPage(1);
      setView("products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load subcategory details"
      );
    } finally {
      setLoading(false);
    }
  };

  const goToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setPage(1);
    setView("categories");
  };

  const goToSubcategories = () => {
    setSelectedSubcategory(null);
    setPage(1);
    setView("subcategories");
  };

  const openEditCategory = async (category: Category) => {
    setEditCategory(category);
    setEditLoading(true);

    try {
      const detail = await categoriesService.getCategory(category.id);
      setEditCategory({
        id: detail.id,
        name: detail.name,
        icon: detail.icon,
        image: detail.image,
        slug: detail.slug,
        is_active: detail.is_active,
        subcategory_count: detail.subcategories.length,
        product_count: category.product_count ?? 0,
      });
    } catch (error) {
      setEditCategory(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to load category details"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const openEditSubcategory = async (subcategory: Subcategory) => {
    const categoryId = selectedCategory?.id ?? subcategory.parent_id;
    if (!categoryId) {
      toast.error("Unable to edit subcategory without a parent category.");
      return;
    }

    setEditSubcategory(subcategory);
    setEditLoading(true);

    try {
      const detail = await categoriesService.getSubcategory(categoryId, subcategory.id);
      setEditSubcategory({
        id: detail.id,
        parent_id: detail.parent_id,
        name: detail.name,
        icon: detail.icon,
        image: detail.image,
        slug: detail.slug,
        is_active: detail.is_active,
        product_count: subcategory.product_count ?? 0,
      });
    } catch (error) {
      setEditSubcategory(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to load subcategory details"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: `${basePath}/dashboard` },
    {
      label: title,
      ...(view !== "categories" ? { onClick: goToCategories } : {}),
    },
    ...(selectedCategory
      ? [
          {
            label: selectedCategory.name,
            ...(view === "products" ? { onClick: goToSubcategories } : {}),
          },
        ]
      : []),
    ...(selectedSubcategory ? [{ label: selectedSubcategory.name }] : []),
  ];

  const pageHeading =
    view === "products" && selectedSubcategory
      ? selectedSubcategory.name
      : view === "subcategories" && selectedCategory
        ? selectedCategory.name
        : title;

  const toCreatePayload = (data: CreateCategoryFormData) => ({
    name: data.name.trim(),
    icon: data.icon ?? null,
    image: data.image ?? null,
    clear_icon: data.clear_icon,
    clear_image: data.clear_image,
    is_active: data.is_active,
  });

  const handleCreateCategory = async (data: CreateCategoryFormData) => {
    try {
      await categoriesService.createCategory(toCreatePayload(data));
      toast.success("Category created successfully");
      setCreateCategoryOpen(false);
      setPage(1);
      await fetchCategories(1, activeFilter);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleCreateSubcategory = async (data: CreateCategoryFormData) => {
    if (!selectedCategory) return;

    try {
      await categoriesService.createSubcategory(
        selectedCategory.id,
        toCreatePayload(data)
      );
      toast.success("Subcategory created successfully");
      setCreateSubcategoryOpen(false);
      await fetchCategoryDetail(selectedCategory.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create subcategory");
    }
  };

  const handleUpdateCategory = async (data: CreateCategoryFormData) => {
    if (!editCategory) return;

    try {
      await categoriesService.updateCategory(editCategory.id, toCreatePayload(data));
      toast.success("Category updated successfully");
      setEditCategory(null);

      if (selectedCategory?.id === editCategory.id) {
        setSelectedCategory((current) =>
          current ? { ...current, name: data.name.trim(), is_active: data.is_active } : current
        );
      }

      await fetchCategories(page, activeFilter);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    }
  };

  const handleUpdateSubcategory = async (data: CreateCategoryFormData) => {
    if (!editSubcategory || !selectedCategory) return;

    try {
      await categoriesService.updateSubcategory(
        selectedCategory.id,
        editSubcategory.id,
        toCreatePayload(data)
      );
      toast.success("Subcategory updated successfully");
      setEditSubcategory(null);

      if (selectedSubcategory?.id === editSubcategory.id) {
        setSelectedSubcategory((current) =>
          current ? { ...current, name: data.name.trim(), is_active: data.is_active } : current
        );
      }

      await fetchCategoryDetail(selectedCategory.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subcategory");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      if (deleteTarget.type === "category") {
        await categoriesService.deleteCategory(deleteTarget.item.id);
        toast.success("Category deleted successfully");

        if (selectedCategory?.id === deleteTarget.item.id) {
          goToCategories();
        }

        await fetchCategories(page, activeFilter);
      } else {
        if (!selectedCategory) return;

        await categoriesService.deleteSubcategory(
          selectedCategory.id,
          deleteTarget.item.id
        );
        toast.success("Subcategory deleted successfully");

        if (selectedSubcategory?.id === deleteTarget.item.id) {
          goToSubcategories();
        }

        await fetchCategoryDetail(selectedCategory.id);
      }

      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const deleteDescription =
    deleteTarget?.type === "category"
      ? `Are you sure you want to delete “${deleteTarget.item.name}”? This will remove the category and cannot be undone.`
      : deleteTarget?.type === "subcategory"
        ? `Are you sure you want to delete “${deleteTarget.item.name}”? This will remove the subcategory and cannot be undone.`
        : "";

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{pageHeading}</h1>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {view === "categories" && (
            <CategoriesView
              data={categories}
              activeFilter={activeFilter}
              onActiveFilterChange={handleActiveFilterChange}
              onSelect={openCategory}
              onEdit={(category) => void openEditCategory(category)}
              onDelete={(category) => setDeleteTarget({ type: "category", item: category })}
              onPageChange={setPage}
              onAdd={() => setCreateCategoryOpen(true)}
            />
          )}
          {view === "subcategories" && selectedCategory && (
            <SubcategoriesView
              category={selectedCategory}
              subcategories={filteredSubcategories}
              activeFilter={activeFilter}
              onActiveFilterChange={handleActiveFilterChange}
              onSelect={(subcategory) => void openSubcategory(subcategory)}
              onEdit={(subcategory) => void openEditSubcategory(subcategory)}
              onDelete={(subcategory) =>
                setDeleteTarget({ type: "subcategory", item: subcategory })
              }
              onAdd={() => setCreateSubcategoryOpen(true)}
            />
          )}
          {view === "products" && selectedSubcategory && (
            <ProductsView
              subcategory={selectedSubcategory}
              data={products}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        title="Add Category"
        description="Create a new top-level category for the marketplace."
        icon={<FolderTree className="h-5 w-5" />}
        className="max-w-xl"
      >
        <CreateCategoryForm
          key={createCategoryOpen ? "create-category-open" : "create-category-closed"}
          formKey={createCategoryOpen ? "create-category-open" : "create-category-closed"}
          submitLabel="Create Category"
          onSubmit={handleCreateCategory}
          onCancel={() => setCreateCategoryOpen(false)}
        />
      </Modal>

      <Modal
        open={createSubcategoryOpen}
        onClose={() => setCreateSubcategoryOpen(false)}
        title="Add Subcategory"
        description={
          selectedCategory
            ? `Add a subcategory under “${selectedCategory.name}”.`
            : "Add a new subcategory."
        }
        icon={<Layers className="h-5 w-5" />}
        className="max-w-xl"
      >
        <CreateCategoryForm
          key={createSubcategoryOpen ? "create-subcategory-open" : "create-subcategory-closed"}
          formKey={createSubcategoryOpen ? "create-subcategory-open" : "create-subcategory-closed"}
          submitLabel="Create Subcategory"
          onSubmit={handleCreateSubcategory}
          onCancel={() => setCreateSubcategoryOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editCategory}
        onClose={() => !editLoading && setEditCategory(null)}
        title="Edit Category"
        description="Update category details and active status."
        icon={<Pencil className="h-5 w-5" />}
        className="max-w-xl"
      >
        {editCategory &&
          (editLoading ? (
            <div className="flex justify-center py-10">
              <Loader size="lg" />
            </div>
          ) : (
            <CreateCategoryForm
              key={`edit-category-${editCategory.id}-loaded`}
              formKey={`edit-category-${editCategory.id}-loaded`}
              submitLabel="Save Changes"
              initialValues={{
                name: editCategory.name,
                is_active: editCategory.is_active,
                iconUrl: editCategory.icon,
                imageUrl: editCategory.image,
              }}
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditCategory(null)}
            />
          ))}
      </Modal>

      <Modal
        open={!!editSubcategory}
        onClose={() => !editLoading && setEditSubcategory(null)}
        title="Edit Subcategory"
        description="Update subcategory details and active status."
        icon={<Pencil className="h-5 w-5" />}
        className="max-w-xl"
      >
        {editSubcategory &&
          (editLoading ? (
            <div className="flex justify-center py-10">
              <Loader size="lg" />
            </div>
          ) : (
            <CreateCategoryForm
              key={`edit-subcategory-${editSubcategory.id}-loaded`}
              formKey={`edit-subcategory-${editSubcategory.id}-loaded`}
              submitLabel="Save Changes"
              initialValues={{
                name: editSubcategory.name,
                is_active: editSubcategory.is_active,
                iconUrl: editSubcategory.icon,
                imageUrl: editSubcategory.image,
              }}
              onSubmit={handleUpdateSubcategory}
              onCancel={() => setEditSubcategory(null)}
            />
          ))}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={
          deleteTarget?.type === "category" ? "Delete Category" : "Delete Subcategory"
        }
        description={deleteDescription}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            className="sm:min-w-24"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleting}
            onClick={() => void handleConfirmDelete()}
            className="sm:min-w-32"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ActiveStatusFilter({
  value,
  onChange,
}: {
  value: ActiveFilter;
  onChange: (value: ActiveFilter) => void;
}) {
  const options: { value: ActiveFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "outline"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function CategoriesView({
  data,
  activeFilter,
  onActiveFilterChange,
  onSelect,
  onEdit,
  onDelete,
  onPageChange,
  onAdd,
}: {
  data: PaginatedData<Category>;
  activeFilter: ActiveFilter;
  onActiveFilterChange: (filter: ActiveFilter) => void;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}) {
  const emptyDescription =
    activeFilter === "active"
      ? "There are no active categories in the system."
      : activeFilter === "inactive"
        ? "There are no inactive categories in the system."
        : "There are no categories in the system.";

  if (data.results.length === 0) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4" />
              Categories
            </CardTitle>
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
          <ActiveStatusFilter value={activeFilter} onChange={onActiveFilterChange} />
        </CardHeader>
        <EmptyState
          icon={<FolderTree className="h-8 w-8 text-muted-foreground" />}
          title="No categories found"
          description={emptyDescription}
          action={
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4" />
            Categories ({data.pagination.total})
          </CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
        <ActiveStatusFilter value={activeFilter} onChange={onActiveFilterChange} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {data.results.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 px-4 py-4 sm:px-6 hover:bg-muted/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelect(category)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{category.slug}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <StatusBadge isActive={category.is_active} />
                  <Badge variant="info">{category.subcategory_count} subcategories</Badge>
                  <Badge variant="outline">{category.product_count} products</Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${category.name}`}
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${category.name}`}
                  onClick={() => onDelete(category)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-4">
          <Pagination pagination={data.pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  );
}

function SubcategoriesView({
  category,
  subcategories,
  activeFilter,
  onActiveFilterChange,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: {
  category: Category;
  subcategories: Subcategory[];
  activeFilter: ActiveFilter;
  onActiveFilterChange: (filter: ActiveFilter) => void;
  onSelect: (subcategory: Subcategory) => void;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategory: Subcategory) => void;
  onAdd: () => void;
}) {
  const emptyDescription =
    activeFilter === "active"
      ? `"${category.name}" has no active subcategories.`
      : activeFilter === "inactive"
        ? `"${category.name}" has no inactive subcategories.`
        : `"${category.name}" has no subcategories yet.`;

  if (subcategories.length === 0) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Subcategories in {category.name}
            </CardTitle>
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              Add Subcategory
            </Button>
          </div>
          <ActiveStatusFilter value={activeFilter} onChange={onActiveFilterChange} />
        </CardHeader>
        <EmptyState
          icon={<Layers className="h-8 w-8 text-muted-foreground" />}
          title="No subcategories"
          description={emptyDescription}
          action={
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4" />
              Add Subcategory
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" />
            Subcategories in {category.name} ({subcategories.length})
          </CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>
        <ActiveStatusFilter value={activeFilter} onChange={onActiveFilterChange} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {subcategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-2 px-4 py-4 sm:px-6 hover:bg-muted/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelect(sub)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge isActive={sub.is_active} />
                  <Badge variant="outline">
                    {sub.product_count ?? 0} products
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${sub.name}`}
                  onClick={() => onEdit(sub)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${sub.name}`}
                  onClick={() => onDelete(sub)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsView({
  subcategory,
  data,
  onPageChange,
}: {
  subcategory: Subcategory;
  data: PaginatedData<Product>;
  onPageChange: (page: number) => void;
}) {
  if (data.results.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Package className="h-8 w-8 text-muted-foreground" />}
          title="No products"
          description={`"${subcategory.name}" has no products listed yet.`}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Products in {subcategory.name} ({data.pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left font-medium px-6 py-3">ID</th>
                <th className="text-left font-medium px-6 py-3">Name</th>
                <th className="text-left font-medium px-6 py-3 hidden sm:table-cell">Slug</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Price</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.results.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 text-muted-foreground">#{product.id}</td>
                  <td className="px-6 py-3 font-medium">{product.name}</td>
                  <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell">
                    {product.slug ?? "—"}
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    {product.price != null ? `₹${product.price}` : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={product.is_active ? "success" : "outline"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <Pagination pagination={data.pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  );
}
