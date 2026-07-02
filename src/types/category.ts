export interface Category {
  id: number;
  name: string;
  icon: string | null;
  image: string | null;
  slug: string;
  is_active: boolean;
  subcategory_count: number;
  product_count: number;
}

export interface Subcategory {
  id: number;
  parent_id: number;
  name: string;
  icon: string | null;
  image: string | null;
  slug: string;
  is_active: boolean;
  product_count?: number;
}

export interface CategoryDetail {
  id: number;
  parent_id: number | null;
  name: string;
  icon: string | null;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  subcategories: Subcategory[];
}

export interface SubcategoryDetail {
  id: number;
  parent_id: number;
  name: string;
  icon: string | null;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UpdateCategoryInput {
  name: string;
  icon?: File | null;
  image?: File | null;
  is_active: boolean;
}

export interface CreateCategoryInput extends UpdateCategoryInput {}
