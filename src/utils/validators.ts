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

const brandFormBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  logo: z.instanceof(File).nullable().optional(),
  clear_logo: z.boolean(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or less"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(120, "Country must be 120 characters or less"),
  website: z.string().trim().max(255, "Website must be 255 characters or less"),
  is_popular: z.boolean(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});

export function getBrandFormSchema(options?: {
  isEdit?: boolean;
  existingLogoUrl?: string | null;
}) {
  return brandFormBaseSchema.superRefine((data, ctx) => {
    const hasNewLogo = data.logo instanceof File;
    const hasExistingLogo = Boolean(
      options?.isEdit && options.existingLogoUrl && !data.clear_logo
    );

    if (!hasNewLogo && !hasExistingLogo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Logo is required",
        path: ["logo"],
      });
    }

    if (data.website) {
      try {
        const parsed = new URL(data.website);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid website URL (e.g. https://www.example.com)",
          path: ["website"],
        });
      }
    }
  });
}

export type BrandFormData = z.infer<typeof brandFormBaseSchema>;

const offerFormBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  discount: z
    .number({ error: "Discount is required" })
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  banner: z.instanceof(File).nullable().optional(),
  clear_banner: z.boolean(),
});

export function getOfferFormSchema() {
  return offerFormBaseSchema;
}

export type OfferFormData = z.infer<typeof offerFormBaseSchema>;

const remarksField = z
  .string()
  .trim()
  .max(2000, "Remarks must be 2000 characters or less");

/** Approve: remarks optional; if provided, min 10 characters. */
export const productApproveSchema = z.object({
  remarks: remarksField.optional().refine(
    (value) => !value || value.length >= 10,
    "Remarks must be at least 10 characters when provided"
  ),
});

/** Request revision / reject: remarks required (min 10). */
export const productDecisionRemarksSchema = z.object({
  remarks: remarksField.min(10, "Remarks must be at least 10 characters"),
});

export type ProductApproveFormData = z.infer<typeof productApproveSchema>;
export type ProductDecisionRemarksFormData = z.infer<
  typeof productDecisionRemarksSchema
>;

