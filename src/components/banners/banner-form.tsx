"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { BannerRedirectSelect } from "@/components/banners/banner-redirect-select";
import { BannerRedirectTypeSelect } from "@/components/banners/banner-redirect-type-select";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { parseBannerRedirectType } from "@/types/banner";
import {
  getBannerFormSchema,
  type BannerFormData,
} from "@/utils/validators";

export interface BannerFormInitialValues {
  title: string;
  redirect_type: BannerFormData["redirect_type"];
  redirect_id: number | null;
  imageUrl?: string | null;
}

interface BannerFormProps {
  submitLabel: string;
  onSubmit: (data: BannerFormData) => Promise<void>;
  onCancel: () => void;
  formKey?: string;
  mode?: "create" | "edit";
  initialValues?: BannerFormInitialValues;
}

const FIELD_ORDER = ["title", "image", "redirect_type", "redirect_id"] as const;

function scrollToFirstError(
  container: HTMLElement | null,
  fieldErrors: FieldErrors<BannerFormData>
) {
  if (!container) return;

  const firstField = FIELD_ORDER.find((field) => fieldErrors[field]);
  if (!firstField) return;

  const target = container.querySelector(`[data-field="${firstField}"]`);
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function normalizeRedirectType(
  value: string | null | undefined
): BannerFormData["redirect_type"] {
  return parseBannerRedirectType(value);
}

export function BannerForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
  mode = "create",
  initialValues,
}: BannerFormProps) {
  const schema = useMemo(
    () =>
      getBannerFormSchema({
        isEdit: mode === "edit",
        existingImageUrl: initialValues?.imageUrl,
      }),
    [mode, initialValues?.imageUrl]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      image: null,
      clear_image: false,
      redirect_type: normalizeRedirectType(initialValues?.redirect_type ?? null),
      redirect_id: initialValues?.redirect_id ?? null,
    },
  });

  const clearImage = watch("clear_image");
  const redirectType = watch("redirect_type");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset({
      title: initialValues?.title ?? "",
      image: null,
      clear_image: false,
      redirect_type: normalizeRedirectType(initialValues?.redirect_type ?? null),
      redirect_id: initialValues?.redirect_id ?? null,
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
        <div data-field="title">
          <Input
            label="Title"
            required
            placeholder="e.g. Winter Sale"
            error={errors.title?.message}
            autoFocus
            {...register("title")}
          />
        </div>

        <div data-field="image">
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Banner Image"
                required
                value={field.value ?? null}
                existingUrl={clearImage ? null : initialValues?.imageUrl}
                onChange={(file) => {
                  field.onChange(file);
                  if (file) {
                    setValue("clear_image", false);
                  }
                }}
                onRemoveExisting={
                  mode === "edit" ? () => setValue("clear_image", true) : undefined
                }
                error={errors.image?.message}
                formats="PNG, JPG, WEBP"
                accept="image/png,image/jpeg,image/webp"
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <div data-field="redirect_type">
            <Controller
              name="redirect_type"
              control={control}
              render={({ field }) => (
                <BannerRedirectTypeSelect
                  value={field.value}
                  onChange={(nextValue) => {
                    field.onChange(nextValue);
                    setValue("redirect_id", null);
                  }}
                />
              )}
            />
          </div>

          <div data-field="redirect_id">
            <Controller
              name="redirect_id"
              control={control}
              render={({ field }) => (
                <BannerRedirectSelect
                  redirectType={redirectType}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.redirect_id?.message}
                />
              )}
            />
          </div>
        </div>

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
