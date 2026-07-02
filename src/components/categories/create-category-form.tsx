"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { createCategorySchema, type CreateCategoryFormData } from "@/utils/validators";

export interface CategoryFormInitialValues {
  name: string;
  is_active: boolean;
  iconUrl?: string | null;
  imageUrl?: string | null;
}

interface CreateCategoryFormProps {
  submitLabel: string;
  onSubmit: (data: CreateCategoryFormData) => Promise<void>;
  onCancel: () => void;
  formKey?: string;
  initialValues?: CategoryFormInitialValues;
}

export function CreateCategoryForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
  initialValues,
}: CreateCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      icon: null,
      image: null,
      clear_icon: false,
      clear_image: false,
      is_active: initialValues?.is_active ?? true,
    },
  });

  const clearIcon = watch("clear_icon");
  const clearImage = watch("clear_image");

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      icon: null,
      image: null,
      clear_icon: false,
      clear_image: false,
      is_active: initialValues?.is_active ?? true,
    });
  }, [formKey, initialValues, reset]);

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
              existingUrl={clearIcon ? null : initialValues?.iconUrl}
              onChange={(file) => {
                field.onChange(file);
                if (file) {
                  setValue("clear_icon", false);
                }
              }}
              onRemoveExisting={() => setValue("clear_icon", true)}
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
              existingUrl={clearImage ? null : initialValues?.imageUrl}
              onChange={(file) => {
                field.onChange(file);
                if (file) {
                  setValue("clear_image", false);
                }
              }}
              onRemoveExisting={() => setValue("clear_image", true)}
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
