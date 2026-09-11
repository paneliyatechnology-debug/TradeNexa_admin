"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CreateCategoryForm } from "@/components/categories/create-category-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeadRow,
  TableLoadingOverlay,
  TableRow,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips, type FilterChipOption } from "@/components/ui/filter-chips";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { DashboardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { PaginatedData, SortOrder } from "@/types/api";
import type { Category, Subcategory, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";
import { PRODUCT_SORT_OPTIONS, type Product, type ProductSortBy } from "@/types/product";
import type { CreateCategoryFormData } from "@/utils/validators";
import { cn } from "@/utils/cn";
import { resolveMediaDisplayUrl, resolveMediaPreviewUrl, resolveMediaUrl } from "@/utils/media-url";
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

const ACTIVE_STATUS_OPTIONS: FilterChipOption<ActiveFilter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

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
  const [listLoading, setListLoading] = useState(true);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  const [hasLoadedSubcategories, setHasLoadedSubcategories] = useState(false);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subSearchInput, setSubSearchInput] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name">("name");
  const [subSortBy, setSubSortBy] = useState<"name">("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [subSortOrder, setSubSortOrder] = useState<SortOrder>("asc");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productSortBy, setProductSortBy] = useState<ProductSortBy>("name");
  const [productSortOrder, setProductSortOrder] = useState<SortOrder>("asc");
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
  const [subcategories, setSubcategories] = useState<PaginatedData<Subcategory>>({
    results: [],
    pagination: defaultPagination,
  });
  const [products, setProducts] = useState<PaginatedData<Product>>({
    results: [],
    pagination: defaultPagination,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(
    null
  );

  const fetchCategories = useCallback(
    async (
      pageNum: number,
      filter: ActiveFilter,
      searchQuery: string,
      sortByValue: "name",
      sortOrderValue: SortOrder
    ) => {
      setListLoading(true);
      try {
        const data = await categoriesService.getCategories({
          page: pageNum,
          limit,
          is_active: toIsActiveParam(filter),
          search: searchQuery || undefined,
          sort_by: sortByValue,
          sort_order: sortOrderValue,
        });
        setCategories(data);
        setHasLoadedCategories(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load categories"
        );
      } finally {
        setListLoading(false);
      }
    },
    [limit]
  );

  const fetchSubcategories = useCallback(
    async (
      categoryId: number,
      pageNum: number,
      filter: ActiveFilter,
      searchQuery: string,
      sortByValue: "name",
      sortOrderValue: SortOrder
    ) => {
      setListLoading(true);
      try {
        const data = await categoriesService.getSubcategories(categoryId, {
          page: pageNum,
          limit,
          is_active: toIsActiveParam(filter),
          search: searchQuery || undefined,
          sort_by: sortByValue,
          sort_order: sortOrderValue,
        });
        setSubcategories(data);
        setHasLoadedSubcategories(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load subcategories"
        );
      } finally {
        setListLoading(false);
      }
    },
    [limit]
  );

  const fetchProducts = useCallback(
    async (
      subcategoryId: number,
      pageNum: number,
      searchQuery: string,
      sortByValue: ProductSortBy,
      sortOrderValue: SortOrder
    ) => {
      setListLoading(true);
      try {
        const data = await productsService.getProducts({
          page: pageNum,
          limit,
          subcategory_id: subcategoryId,
          search: searchQuery || undefined,
          sort_by: sortByValue,
          sort_order: sortOrderValue,
        });
        setProducts(data);
        setHasLoadedProducts(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        setListLoading(false);
      }
    },
    [limit]
  );

  const prevSearchRef = useRef("");
  const prevSubSearchRef = useRef("");
  const prevProductSearchRef = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (prevSearchRef.current === trimmed) return;

      prevSearchRef.current = trimmed;
      setSearch(trimmed);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = subSearchInput.trim();
      if (prevSubSearchRef.current === trimmed) return;

      prevSubSearchRef.current = trimmed;
      setSubSearch(trimmed);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [subSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = productSearchInput.trim();
      if (prevProductSearchRef.current === trimmed) return;

      prevProductSearchRef.current = trimmed;
      setProductSearch(trimmed);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [productSearchInput]);

  useEffect(() => {
    if (view === "categories") {
      fetchCategories(page, activeFilter, search, sortBy, sortOrder);
    }
  }, [view, page, activeFilter, search, sortBy, sortOrder, fetchCategories]);

  useEffect(() => {
    if (view === "subcategories" && selectedCategory) {
      fetchSubcategories(
        selectedCategory.id,
        page,
        activeFilter,
        subSearch,
        subSortBy,
        subSortOrder
      );
    }
  }, [
    view,
    page,
    activeFilter,
    subSearch,
    subSortBy,
    subSortOrder,
    selectedCategory?.id,
    fetchSubcategories,
  ]);

  const handleSortByChange = (value: "name") => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleSubSortByChange = (value: "name") => {
    setSubSortBy(value);
    setPage(1);
  };

  const handleSubSortOrderChange = (value: SortOrder) => {
    setSubSortOrder(value);
    setPage(1);
  };

  const handleProductSortByChange = (value: ProductSortBy) => {
    setProductSortBy(value);
    setPage(1);
  };

  const handleProductSortOrderChange = (value: SortOrder) => {
    setProductSortOrder(value);
    setPage(1);
  };

  const handleActiveFilterChange = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  useEffect(() => {
    if (view === "products" && selectedSubcategory) {
      fetchProducts(
        selectedSubcategory.id,
        page,
        productSearch,
        productSortBy,
        productSortOrder
      );
    }
  }, [
    view,
    page,
    selectedSubcategory,
    productSearch,
    productSortBy,
    productSortOrder,
    fetchProducts,
  ]);

  const resetSubcategoryFilters = () => {
    setSubSearchInput("");
    setSubSearch("");
    prevSubSearchRef.current = "";
    setSubSortBy("name");
    setSubSortOrder("asc");
  };

  const resetProductFilters = () => {
    setProductSearchInput("");
    setProductSearch("");
    prevProductSearchRef.current = "";
    setProductSortBy("name");
    setProductSortOrder("asc");
  };

  const openCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setHasLoadedSubcategories(false);
    setPage(1);
    resetSubcategoryFilters();
    setView("subcategories");
  };

  const openSubcategory = async (subcategory: Subcategory) => {
    if (!selectedCategory) return;

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
      setHasLoadedProducts(false);
      resetProductFilters();
      setPage(1);
      setView("products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load subcategory details"
      );
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

  const toCreatePayload = (data: CreateCategoryFormData): CreateCategoryInput => {
    if (!(data.icon instanceof File)) {
      throw new Error("Icon is required");
    }

    return {
      name: data.name.trim(),
      icon: data.icon,
      image: data.image ?? null,
      is_active: data.is_active,
    };
  };

  const toUpdatePayload = (data: CreateCategoryFormData): UpdateCategoryInput => ({
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
      await fetchCategories(1, activeFilter, search, sortBy, sortOrder);
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
      setPage(1);
      await fetchSubcategories(
        selectedCategory.id,
        1,
        activeFilter,
        subSearch,
        subSortBy,
        subSortOrder
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create subcategory");
    }
  };

  const handleUpdateCategory = async (data: CreateCategoryFormData) => {
    if (!editCategory) return;

    try {
      await categoriesService.updateCategory(editCategory.id, toUpdatePayload(data));
      toast.success("Category updated successfully");
      setEditCategory(null);

      if (selectedCategory?.id === editCategory.id) {
        setSelectedCategory((current) =>
          current ? { ...current, name: data.name.trim(), is_active: data.is_active } : current
        );
      }

      await fetchCategories(page, activeFilter, search, sortBy, sortOrder);
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
        toUpdatePayload(data)
      );
      toast.success("Subcategory updated successfully");
      setEditSubcategory(null);

      if (selectedSubcategory?.id === editSubcategory.id) {
        setSelectedSubcategory((current) =>
          current ? { ...current, name: data.name.trim(), is_active: data.is_active } : current
        );
      }

      await fetchSubcategories(
        selectedCategory.id,
        page,
        activeFilter,
        subSearch,
        subSortBy,
        subSortOrder
      );
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

        await fetchCategories(page, activeFilter, search, sortBy, sortOrder);
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

        await fetchSubcategories(
        selectedCategory.id,
        page,
        activeFilter,
        subSearch,
        subSortBy,
        subSortOrder
      );
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

  const showInitialSkeleton =
    listLoading &&
    ((view === "categories" && !hasLoadedCategories) ||
      (view === "subcategories" && !hasLoadedSubcategories) ||
      (view === "products" && !hasLoadedProducts));

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">{pageHeading}</h1>
      </div>

      {showInitialSkeleton ? (
        <DashboardSkeleton />
      ) : (
        <>
          {view === "categories" && (
            <CategoriesView
              data={categories}
              loading={listLoading}
              activeFilter={activeFilter}
              search={searchInput}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={setSearchInput}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
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
              data={subcategories}
              loading={listLoading}
              activeFilter={activeFilter}
              search={subSearchInput}
              sortBy={subSortBy}
              sortOrder={subSortOrder}
              onSearchChange={setSubSearchInput}
              onSortByChange={handleSubSortByChange}
              onSortOrderChange={handleSubSortOrderChange}
              onActiveFilterChange={handleActiveFilterChange}
              onSelect={(subcategory) => void openSubcategory(subcategory)}
              onEdit={(subcategory) => void openEditSubcategory(subcategory)}
              onDelete={(subcategory) =>
                setDeleteTarget({ type: "subcategory", item: subcategory })
              }
              onPageChange={setPage}
              onAdd={() => setCreateSubcategoryOpen(true)}
            />
          )}
          {view === "products" && selectedSubcategory && (
            <ProductsView
              subcategory={selectedSubcategory}
              data={products}
              loading={listLoading}
              search={productSearchInput}
              sortBy={productSortBy}
              sortOrder={productSortOrder}
              onSearchChange={setProductSearchInput}
              onSortByChange={handleProductSortByChange}
              onSortOrderChange={handleProductSortOrderChange}
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
            <div className="flex justify-center px-5 py-10 sm:px-6">
              <Loader size="lg" />
            </div>
          ) : (
            <CreateCategoryForm
              key={`edit-category-${editCategory.id}-loaded`}
              formKey={`edit-category-${editCategory.id}-loaded`}
              mode="edit"
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
            <div className="flex justify-center px-5 py-10 sm:px-6">
              <Loader size="lg" />
            </div>
          ) : (
            <CreateCategoryForm
              key={`edit-subcategory-${editSubcategory.id}-loaded`}
              formKey={`edit-subcategory-${editSubcategory.id}-loaded`}
              mode="edit"
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
        footer={
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
        }
      />
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

function CategoryIcon({ icon, name }: { icon: string | null; name: string }) {
  const displayUrl = resolveMediaDisplayUrl(icon);
  const fallbackUrl = resolveMediaPreviewUrl(icon);
  const [src, setSrc] = useState(displayUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveMediaDisplayUrl(icon));
    setFailed(false);
  }, [icon]);

  if (!icon || failed || !src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
        <FolderTree className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} icon`}
      className="h-10 w-10 shrink-0 rounded-md border border-border bg-card object-contain p-1.5"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={() => {
        if (fallbackUrl && src !== fallbackUrl) {
          setSrc(fallbackUrl);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function SubcategoryIcon({ icon, name }: { icon: string | null; name: string }) {
  const displayUrl = resolveMediaDisplayUrl(icon);
  const fallbackUrl = resolveMediaPreviewUrl(icon);
  const [src, setSrc] = useState(displayUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveMediaDisplayUrl(icon));
    setFailed(false);
  }, [icon]);

  if (!icon || failed || !src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
        <Layers className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} icon`}
      className="h-10 w-10 shrink-0 rounded-md border border-border bg-card object-contain p-1.5"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={() => {
        if (fallbackUrl && src !== fallbackUrl) {
          setSrc(fallbackUrl);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function ListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-2.5 sm:px-6">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

const selectClassName = cn(
  "h-9 rounded-md border border-border bg-card px-3 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50"
);

function SearchSortToolbar<T extends string = "name">({
  search,
  sortBy,
  sortOrder,
  searchPlaceholder,
  sortById,
  sortOrderId,
  sortOptions = [{ value: "name" as T, label: "Name" }],
  sortOrderAscLabel = "A → Z",
  sortOrderDescLabel = "Z → A",
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
}: {
  search: string;
  sortBy: T;
  sortOrder: SortOrder;
  searchPlaceholder: string;
  sortById: string;
  sortOrderId: string;
  sortOptions?: { value: T; label: string }[];
  sortOrderAscLabel?: string;
  sortOrderDescLabel?: string;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: T) => void;
  onSortOrderChange: (value: SortOrder) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchField
        containerClassName="flex-1"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={sortById}>
          Sort by
        </label>
        <select
          id={sortById}
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as T)}
          className={selectClassName}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={sortOrderId}>
          Sort order
        </label>
        <select
          id={sortOrderId}
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value as SortOrder)}
          className={selectClassName}
        >
          <option value="asc">{sortOrderAscLabel}</option>
          <option value="desc">{sortOrderDescLabel}</option>
        </select>
      </div>
    </div>
  );
}

function CategoriesView({
  data,
  loading,
  activeFilter,
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onActiveFilterChange,
  onSelect,
  onEdit,
  onDelete,
  onPageChange,
  onAdd,
}: {
  data: PaginatedData<Category>;
  loading: boolean;
  activeFilter: ActiveFilter;
  search: string;
  sortBy: "name";
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: "name") => void;
  onSortOrderChange: (value: SortOrder) => void;
  onActiveFilterChange: (filter: ActiveFilter) => void;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}) {
  const trimmedSearch = search.trim();
  const emptyDescription = trimmedSearch
    ? `No categories match "${trimmedSearch}".`
    : activeFilter === "active"
      ? "There are no active categories in the system."
      : activeFilter === "inactive"
        ? "There are no inactive categories in the system."
        : "There are no categories in the system.";

  const toolbar = (
    <>
      <SearchSortToolbar
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchPlaceholder="Search categories..."
        sortById="category-sort-by"
        sortOrderId="category-sort-order"
        onSearchChange={onSearchChange}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />
      <FilterChips
        options={ACTIVE_STATUS_OPTIONS}
        value={activeFilter}
        onChange={onActiveFilterChange}
        aria-label="Active status"
      />
    </>
  );

  if (!loading && data.results.length === 0) {
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
          {toolbar}
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
            Categories ({loading ? "…" : data.pagination.total})
          </CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
        {toolbar}
      </CardHeader>
      <CardContent className="p-0">
        {loading && data.results.length === 0 ? (
          <ListRowsSkeleton />
        ) : (
          <TableLoadingOverlay loading={loading}>
            <div className="divide-y divide-border">
              {data.results.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-6 hover:bg-accent/40 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelect(category)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <CategoryIcon icon={category.icon} name={category.name} />
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
              <div className="flex shrink-0 items-center gap-1.5">
                <IconButton
                  label="Edit category"
                  tone="view"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  label="Delete category"
                  tone="danger"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
            </div>
          </TableLoadingOverlay>
        )}
        <div className="px-6 pb-4">
          <Pagination pagination={data.pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  );
}

function SubcategoriesView({
  category,
  data,
  loading,
  activeFilter,
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onActiveFilterChange,
  onSelect,
  onEdit,
  onDelete,
  onPageChange,
  onAdd,
}: {
  category: Category;
  data: PaginatedData<Subcategory>;
  loading: boolean;
  activeFilter: ActiveFilter;
  search: string;
  sortBy: "name";
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: "name") => void;
  onSortOrderChange: (value: SortOrder) => void;
  onActiveFilterChange: (filter: ActiveFilter) => void;
  onSelect: (subcategory: Subcategory) => void;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategory: Subcategory) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}) {
  const trimmedSearch = search.trim();
  const emptyDescription = trimmedSearch
    ? `No subcategories match "${trimmedSearch}".`
    : activeFilter === "active"
      ? `"${category.name}" has no active subcategories.`
      : activeFilter === "inactive"
        ? `"${category.name}" has no inactive subcategories.`
        : `"${category.name}" has no subcategories yet.`;

  const toolbar = (
    <>
      <SearchSortToolbar
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchPlaceholder="Search subcategories..."
        sortById="subcategory-sort-by"
        sortOrderId="subcategory-sort-order"
        onSearchChange={onSearchChange}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />
      <FilterChips
        options={ACTIVE_STATUS_OPTIONS}
        value={activeFilter}
        onChange={onActiveFilterChange}
        aria-label="Active status"
      />
    </>
  );

  if (!loading && data.results.length === 0) {
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
          {toolbar}
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
            Subcategories in {category.name} ({loading ? "…" : data.pagination.total})
          </CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>
        {toolbar}
      </CardHeader>
      <CardContent className="p-0">
        {loading && data.results.length === 0 ? (
          <ListRowsSkeleton />
        ) : (
          <TableLoadingOverlay loading={loading}>
            <div className="divide-y divide-border">
              {data.results.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-6 hover:bg-accent/40 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelect(sub)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <SubcategoryIcon icon={sub.icon} name={sub.name} />
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
              <div className="flex shrink-0 items-center gap-1.5">
                <IconButton
                  label="Edit subcategory"
                  tone="view"
                  onClick={() => onEdit(sub)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  label="Delete subcategory"
                  tone="danger"
                  onClick={() => onDelete(sub)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
            </div>
          </TableLoadingOverlay>
        )}
        <div className="px-6 pb-4">
          <Pagination pagination={data.pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsView({
  subcategory,
  data,
  loading,
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onPageChange,
}: {
  subcategory: Subcategory;
  data: PaginatedData<Product>;
  loading: boolean;
  search: string;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: ProductSortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onPageChange: (page: number) => void;
}) {
  const trimmedSearch = search.trim();
  const emptyDescription = trimmedSearch
    ? `No products match "${trimmedSearch}".`
    : `"${subcategory.name}" has no products listed yet.`;

  const toolbar = (
    <SearchSortToolbar
      search={search}
      sortBy={sortBy}
      sortOrder={sortOrder}
      searchPlaceholder="Search products..."
      sortById="product-sort-by"
      sortOrderId="product-sort-order"
      sortOptions={PRODUCT_SORT_OPTIONS}
      sortOrderAscLabel="Ascending"
      sortOrderDescLabel="Descending"
      onSearchChange={onSearchChange}
      onSortByChange={onSortByChange}
      onSortOrderChange={onSortOrderChange}
    />
  );

  if (!loading && data.results.length === 0) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Products in {subcategory.name}
          </CardTitle>
          {toolbar}
        </CardHeader>
        <EmptyState
          icon={<Package className="h-8 w-8 text-muted-foreground" />}
          title="No products"
          description={emptyDescription}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Products in {subcategory.name} ({loading ? "…" : data.pagination.total})
        </CardTitle>
        {toolbar}
      </CardHeader>
      <CardContent className="p-0">
        {loading && data.results.length === 0 ? (
          <div className="px-6 py-8">
            <ListRowsSkeleton rows={4} />
          </div>
        ) : (
          <TableLoadingOverlay loading={loading}>
            <DataTable minWidthClassName="min-w-0">
              <thead>
                <TableHeadRow>
                  <TableHeadCell>ID</TableHeadCell>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell className="hidden lg:table-cell">
                    Supplier
                  </TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                    Price
                  </TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                    MOQ
                  </TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                    Rating
                  </TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableHeadRow>
              </thead>
              <TableBody>
                {data.results.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground">#{product.id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.slug}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{product.supplier_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.currency === "INR" ? "₹" : `${product.currency} `}
                      {product.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {product.moq} {product.unit}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.rating.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {product.verified && <Badge variant="success">Verified</Badge>}
                        {product.is_trending && <Badge variant="info">Trending</Badge>}
                        {!product.verified && !product.is_trending && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </TableLoadingOverlay>
        )}
        <div className="px-6 pb-4">
          <Pagination pagination={data.pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  );
}
