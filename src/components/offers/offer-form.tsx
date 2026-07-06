"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { formatExpiryDateForInput } from "@/types/offer";
import { getOfferFormSchema, type OfferFormData } from "@/utils/validators";

export interface OfferFormInitialValues {
  title: string;
  discount: number;
  expiry_date: string;
  bannerUrl?: string | null;
}

interface OfferFormProps {
  submitLabel: string;
  onSubmit: (data: OfferFormData) => Promise<void>;
  onCancel: () => void;
  formKey?: string;
  mode?: "create" | "edit";
  initialValues?: OfferFormInitialValues;
}

const FIELD_ORDER = ["title", "discount", "expiry_date", "banner"] as const;

function scrollToFirstError(
  container: HTMLElement | null,
  fieldErrors: FieldErrors<OfferFormData>
) {
  if (!container) return;

  const firstField = FIELD_ORDER.find((field) => fieldErrors[field]);
  if (!firstField) return;

  const target = container.querySelector(`[data-field="${firstField}"]`);
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function OfferForm({
  submitLabel,
  onSubmit,
  onCancel,
  formKey,
  mode = "create",
  initialValues,
}: OfferFormProps) {
  const schema = useMemo(() => getOfferFormSchema(), []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      discount: initialValues?.discount ?? 0,
      expiry_date: formatExpiryDateForInput(initialValues?.expiry_date) || "",
      banner: null,
      clear_banner: false,
    },
  });

  const clearBanner = watch("clear_banner");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset({
      title: initialValues?.title ?? "",
      discount: initialValues?.discount ?? 0,
      expiry_date: formatExpiryDateForInput(initialValues?.expiry_date) || "",
      banner: null,
      clear_banner: false,
    });
  }, [formKey, initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
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
            placeholder="e.g. Flat 20% Off Electronics"
            error={errors.title?.message}
            autoFocus
            {...register("title")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div data-field="discount">
            <Input
              label="Discount (%)"
              required
              type="number"
              min={1}
              max={100}
              step={1}
              placeholder="e.g. 20"
              error={errors.discount?.message}
              {...register("discount", { valueAsNumber: true })}
            />
          </div>

          <div data-field="expiry_date">
            <Input
              label="Expiry Date"
              required
              type="date"
              error={errors.expiry_date?.message}
              {...register("expiry_date")}
            />
          </div>
        </div>

        <div data-field="banner">
          <Controller
            name="banner"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Offer Banner"
                value={field.value ?? null}
                existingUrl={clearBanner ? null : initialValues?.bannerUrl}
                onChange={(file) => {
                  field.onChange(file);
                  if (file) {
                    setValue("clear_banner", false);
                  }
                }}
                onRemoveExisting={
                  mode === "edit" ? () => setValue("clear_banner", true) : undefined
                }
                error={errors.banner?.message}
                formats="PNG, JPG, WEBP"
                accept="image/png,image/jpeg,image/webp"
              />
            )}
          />
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
