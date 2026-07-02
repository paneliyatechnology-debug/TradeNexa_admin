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

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  icon: z.instanceof(File).nullable().optional(),
  image: z.instanceof(File).nullable().optional(),
  is_active: z.boolean(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
