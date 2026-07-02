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
  product_count: number;
}

export interface CreateCategoryInput {
  name: string;
  icon?: File | null;
  image?: File | null;
  is_active: boolean;
}
