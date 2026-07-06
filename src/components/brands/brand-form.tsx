"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { getBrandFormSchema, type BrandFormData } from "@/utils/validators";

export interface BrandFormInitialValues {
  name: string;
  is_popular: boolean;
  logoUrl?: string | null;
}

interface BrandFormProps {
  submitLabel: string;
  onSubmit: (data: BrandFormData) => Promise<void>;
  onCancel: () => void;
  formKey?: string;
  mode?: "create" | "edit";
  initialValues?: BrandFormInitialValues;
}

const FIELD_ORDER = ["name", "logo"] as const;

function scrollToFirstError(
  container: HTMLElement | null,
  fieldErrors: FieldErrors<BrandFormData>
) {
  if (!container) return;

  const firstField = FIELD_ORDER.find((field) => fieldErrors[field]);
  if (!firstField) return;

  const target = container.querySelector(`[data-field="${firstField}"]`);
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function BrandForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
  mode = "create",
  initialValues,
}: BrandFormProps) {
  const schema = useMemo(
    () =>
      getBrandFormSchema({
        isEdit: mode === "edit",
        existingLogoUrl: initialValues?.logoUrl,
      }),
    [mode, initialValues?.logoUrl]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      logo: null,
      clear_logo: false,
      is_popular: initialValues?.is_popular ?? false,
    },
  });

  const clearLogo = watch("clear_logo");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      logo: null,
      clear_logo: false,
      is_popular: initialValues?.is_popular ?? false,
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
            placeholder="e.g. Kingston"
            error={errors.name?.message}
            autoFocus
            {...register("name")}
          />
        </div>

        <div data-field="logo">
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Logo"
                required
                value={field.value ?? null}
                existingUrl={clearLogo ? null : initialValues?.logoUrl}
                onChange={(file) => {
                  field.onChange(file);
                  if (file) {
                    setValue("clear_logo", false);
                  }
                }}
                onRemoveExisting={
                  mode === "edit" ? () => setValue("clear_logo", true) : undefined
                }
                error={errors.logo?.message}
                formats="PNG, JPG, WEBP"
                accept="image/png,image/jpeg,image/webp"
              />
            )}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-muted/20 px-4 py-3.5 text-sm">
          <Controller
            name="is_popular"
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
          <span className="font-medium">Popular brand</span>
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
