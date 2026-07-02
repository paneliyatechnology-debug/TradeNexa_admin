export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  price?: number | null;
  mrp?: number | null;
  is_active?: boolean;
  subcategory_id?: number;
  category_id?: number;
  seller_id?: number;
  sku?: string | null;
  unit?: string | null;
  min_order_quantity?: number | null;
  created_at?: string;
  updated_at?: string;
}
