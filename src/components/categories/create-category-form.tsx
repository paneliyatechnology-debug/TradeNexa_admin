"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { getCategoryFormSchema, type CreateCategoryFormData } from "@/utils/validators";

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
  mode?: "create" | "edit";
  initialValues?: CategoryFormInitialValues;
}

const FIELD_ORDER = ["name", "icon", "image"] as const;

function scrollToFirstError(
  container: HTMLElement | null,
  fieldErrors: FieldErrors<CreateCategoryFormData>
) {
  if (!container) return;

  const firstField = FIELD_ORDER.find((field) => fieldErrors[field]);
  if (!firstField) return;

  const target = container.querySelector(`[data-field="${firstField}"]`);
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable = target.querySelector<HTMLElement>(
    "input:not([type='file']):not([type='checkbox']), button, textarea"
  );
  focusable?.focus({ preventScroll: true });
}

export function CreateCategoryForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
  mode = "create",
  initialValues,
}: CreateCategoryFormProps) {
  const schema = useMemo(
    () =>
      getCategoryFormSchema({
        isEdit: mode === "edit",
        existingIconUrl: initialValues?.iconUrl,
      }),
    [mode, initialValues?.iconUrl]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(schema),
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        scrollToFirstError(scrollContainerRef.current, fieldErrors);
      })}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div data-field="name">
          <Input
            label="Name"
            required
            placeholder="e.g. Laboratory Instruments"
            error={errors.name?.message}
            autoFocus
            {...register("name")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="icon">
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Icon"
                  required
                  variant="compact"
                  value={field.value ?? null}
                  existingUrl={clearIcon ? null : initialValues?.iconUrl}
                  onChange={(file) => {
                    field.onChange(file);
                    if (file) {
                      setValue("clear_icon", false);
                    }
                  }}
                  onRemoveExisting={
                    mode === "edit" ? () => setValue("clear_icon", true) : undefined
                  }
                  error={errors.icon?.message}
                  formats="PNG, JPG, WEBP, SVG"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                />
              )}
            />
          </div>

          <div data-field="image">
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
        </div>

        <label className="flex items-center gap-2.5 rounded-md border border-border bg-muted/20 px-4 py-3.5 text-sm cursor-pointer">
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
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-card px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
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
