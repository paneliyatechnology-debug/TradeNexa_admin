"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { createCategorySchema, type CreateCategoryFormData } from "@/utils/validators";

interface CreateCategoryFormProps {
  submitLabel: string;
  onSubmit: (data: CreateCategoryFormData) => Promise<void>;
  onCancel: () => void;
  formKey?: string;
}

export function CreateCategoryForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
}: CreateCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      icon: null,
      image: null,
      is_active: true,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      icon: null,
      image: null,
      is_active: true,
    });
  }, [formKey, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
        const firstError = Object.values(fieldErrors)[0]?.message;
        toast.error(firstError ?? "Please fix the form errors");
      })}
      className="space-y-5"
    >
      <Input
        label="Name"
        placeholder="e.g. Laboratory Instruments"
        error={errors.name?.message}
        autoFocus
        {...register("name")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="Icon"
              variant="compact"
              value={field.value ?? null}
              onChange={field.onChange}
              error={errors.icon?.message}
              formats="PNG, JPG, WEBP, SVG"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
            />
          )}
        />

        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="Image"
              variant="compact"
              value={field.value ?? null}
              onChange={field.onChange}
              error={errors.image?.message}
              formats="PNG, JPG, WEBP"
              accept="image/png,image/jpeg,image/webp"
            />
          )}
        />
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/20 px-4 py-3.5 text-sm cursor-pointer">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/50"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        <span className="font-medium">Active</span>
      </label>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="sm:min-w-24"
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="sm:min-w-36">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
