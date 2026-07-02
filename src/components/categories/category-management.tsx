"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { PaginatedData } from "@/types/api";
import type { Category, Subcategory } from "@/types/category";
import type { Product } from "@/types/product";
import type { CreateCategoryFormData } from "@/utils/validators";
import {
  ChevronRight,
  FolderTree,
  Layers,
  Package,
  Plus,
} from "lucide-react";

type View = "categories" | "subcategories" | "products";

interface CategoryManagementProps {
  title: string;
  basePath: string;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export function CategoryManagement({ title, basePath }: CategoryManagementProps) {
  const { token } = useAuth();
  const [view, setView] = useState<View>("categories");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createSubcategoryOpen, setCreateSubcategoryOpen] = useState(false);

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

  const fetchCategories = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await categoriesService.getCategories({
        page: pageNum,
        limit,
        is_active: true,
      });
      setCategories(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const fetchSubcategories = useCallback(
    async (categoryId: number, pageNum: number) => {
      setLoading(true);
      try {
        const data = await categoriesService.getSubcategories(categoryId, {
          page: pageNum,
          limit,
        });
        setSubcategories(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load subcategories"
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

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
      fetchCategories(page);
    }
  }, [view, page, fetchCategories]);

  useEffect(() => {
    if (view === "subcategories" && selectedCategory) {
      fetchSubcategories(selectedCategory.id, page);
    }
  }, [view, page, selectedCategory, fetchSubcategories]);

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

  const openSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setPage(1);
    setView("products");
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
    is_active: data.is_active,
  });

  const handleCreateCategory = async (data: CreateCategoryFormData) => {
    if (!token) {
      toast.error("You must be logged in to create a category");
      return;
    }

    try {
      await categoriesService.createCategory(toCreatePayload(data));
      toast.success("Category created successfully");
      setCreateCategoryOpen(false);
      setPage(1);
      await fetchCategories(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleCreateSubcategory = async (data: CreateCategoryFormData) => {
    if (!token) {
      toast.error("You must be logged in to create a subcategory");
      return;
    }

    if (!selectedCategory) return;

    try {
      await categoriesService.createSubcategory(
        selectedCategory.id,
        toCreatePayload(data)
      );
      toast.success("Subcategory created successfully");
      setCreateSubcategoryOpen(false);
      setPage(1);
      await fetchSubcategories(selectedCategory.id, 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create subcategory");
    }
  };

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
              onSelect={openCategory}
              onPageChange={setPage}
              onAdd={() => setCreateCategoryOpen(true)}
            />
          )}
          {view === "subcategories" && selectedCategory && (
            <SubcategoriesView
              category={selectedCategory}
              data={subcategories}
              onSelect={openSubcategory}
              onPageChange={setPage}
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
    </div>
  );
}

function CategoriesView({
  data,
  onSelect,
  onPageChange,
  onAdd,
}: {
  data: PaginatedData<Category>;
  onSelect: (category: Category) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}) {
  if (data.results.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<FolderTree className="h-8 w-8 text-muted-foreground" />}
          title="No categories found"
          description="There are no active categories in the system."
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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderTree className="h-4 w-4" />
          Categories ({data.pagination.total})
        </CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {data.results.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderTree className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{category.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{category.slug}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Badge variant="info">{category.subcategory_count} subcategories</Badge>
                <Badge variant="outline">{category.product_count} products</Badge>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
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
  data,
  onSelect,
  onPageChange,
  onAdd,
}: {
  category: Category;
  data: PaginatedData<Subcategory>;
  onSelect: (subcategory: Subcategory) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}) {
  if (data.results.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Layers className="h-8 w-8 text-muted-foreground" />}
          title="No subcategories"
          description={`"${category.name}" has no subcategories yet.`}
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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4" />
          Subcategories in {category.name} ({data.pagination.total})
        </CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Subcategory
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {data.results.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelect(sub)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{sub.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub.slug}</p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {sub.product_count} products
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
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
