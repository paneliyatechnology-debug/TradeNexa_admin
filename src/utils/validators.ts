import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const categoryFormBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  icon: z.instanceof(File).nullable().optional(),
  image: z.instanceof(File).nullable().optional(),
  clear_icon: z.boolean(),
  clear_image: z.boolean(),
  is_active: z.boolean(),
});

export function getCategoryFormSchema(options?: {
  isEdit?: boolean;
  existingIconUrl?: string | null;
}) {
  return categoryFormBaseSchema.superRefine((data, ctx) => {
    const hasNewIcon = data.icon instanceof File;
    const hasExistingIcon = Boolean(
      options?.isEdit && options.existingIconUrl && !data.clear_icon
    );

    if (!hasNewIcon && !hasExistingIcon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Icon is required",
        path: ["icon"],
      });
    }
  });
}

export const createCategorySchema = getCategoryFormSchema();

export type CreateCategoryFormData = z.infer<typeof categoryFormBaseSchema>;

const bannerRedirectTypes = ["category", "product"] as const;

const bannerFormBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  image: z.instanceof(File).nullable().optional(),
  clear_image: z.boolean(),
  redirect_type: z.enum(bannerRedirectTypes).nullable(),
  redirect_id: z.number().int().positive().nullable(),
});

export function getBannerFormSchema(options?: {
  isEdit?: boolean;
  existingImageUrl?: string | null;
}) {
  return bannerFormBaseSchema.superRefine((data, ctx) => {
    const hasNewImage = data.image instanceof File;
    const hasExistingImage = Boolean(
      options?.isEdit && options.existingImageUrl && !data.clear_image
    );

    if (!hasNewImage && !hasExistingImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Banner image is required",
        path: ["image"],
      });
    }
  });
}

export type BannerFormData = z.infer<typeof bannerFormBaseSchema>;
export const BANNER_REDIRECT_TYPES = bannerRedirectTypes;

