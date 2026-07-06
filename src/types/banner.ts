export type BannerRedirectType = "category" | "product" | null;

export interface Banner {
  id: number;
  title: string;
  image: string | null;
  redirect_type: BannerRedirectType;
  redirect_id: number | null;
  priority: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBannerInput {
  title: string;
  image: File;
  redirect_type: BannerRedirectType;
  redirect_id: number | null;
  priority: number;
}

export interface UpdateBannerInput {
  title: string;
  image?: File | null;
  clear_image?: boolean;
  redirect_type: BannerRedirectType;
  redirect_id: number | null;
  priority: number;
}

export function parseBannerRedirectType(
  value: string | null | undefined
): BannerRedirectType {
  if (value === "category" || value === "product") {
    return value;
  }

  return null;
}
