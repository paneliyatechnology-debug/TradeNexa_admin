export interface Product {
  id: number;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  currency: string;
  moq: number;
  unit: string;
  supplier_name: string;
  verified: boolean;
  rating: number;
  city: string | null;
  state: string | null;
  is_trending: boolean;
  created_at: string;
}

export type ProductSortBy =
  | "id"
  | "name"
  | "supplier_name"
  | "price"
  | "moq"
  | "rating"
  | "verified"
  | "is_trending"
  | "created_at";

export const PRODUCT_SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "name", label: "Name" },
  { value: "supplier_name", label: "Supplier" },
  { value: "price", label: "Price" },
  { value: "moq", label: "MOQ" },
  { value: "rating", label: "Rating" },
  { value: "verified", label: "Verified" },
  { value: "is_trending", label: "Trending" },
  { value: "created_at", label: "Created" },
];
