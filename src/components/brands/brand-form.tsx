"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, type Ref } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { getBrandFormSchema, type BrandFormData } from "@/utils/validators";

export interface BrandFormInitialValues {
  name: string;
  description?: string | null;
  country?: string | null;
  website?: string | null;
  is_popular: boolean;
  is_active: boolean;
  is_featured: boolean;
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

const FIELD_ORDER = [
  "name",
  "logo",
  "description",
  "country",
  "website",
] as const;

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

  const focusable = target.querySelector<HTMLElement>(
    "input:not([type='file']):not([type='checkbox']), button, textarea"
  );
  focusable?.focus({ preventScroll: true });
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function CheckboxField({
  label,
  checked,
  onChange,
  onBlur,
  inputRef,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-muted/20 px-4 py-3.5 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/50"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        onBlur={onBlur}
        ref={inputRef}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
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
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: initialValues?.name ?? "",
      logo: null,
      clear_logo: false,
      description: initialValues?.description ?? "",
      country: initialValues?.country ?? "",
      website: initialValues?.website ?? "",
      is_popular: initialValues?.is_popular ?? false,
      is_active: initialValues?.is_active ?? true,
      is_featured: initialValues?.is_featured ?? false,
    },
  });

  const clearLogo = watch("clear_logo");
  const description = watch("description");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      logo: null,
      clear_logo: false,
      description: initialValues?.description ?? "",
      country: initialValues?.country ?? "",
      website: initialValues?.website ?? "",
      is_popular: initialValues?.is_popular ?? false,
      is_active: initialValues?.is_active ?? true,
      is_featured: initialValues?.is_featured ?? false,
    });
  }, [formKey, initialValues, reset]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
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
            placeholder="e.g. Tata Sons"
            error={errors.name?.message}
            autoFocus
            {...register("name")}
          />
        </div>

        <div data-field="logo">
          <Controller
            name="logo"
            control={control}
            render={({ field, fieldState }) => (
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
                error={fieldState.error?.message}
                formats="PNG, JPG, WEBP"
                accept="image/png,image/jpeg,image/webp"
              />
            )}
          />
        </div>

        <div data-field="description" className="space-y-1.5">
          <label htmlFor="brand-description" className="block text-sm font-medium text-foreground">
            Description <span className="text-destructive">*</span>
          </label>
          <textarea
            id="brand-description"
            rows={4}
            minLength={10}
            maxLength={2000}
            placeholder="Leading industrial brand with nationwide distribution..."
            aria-invalid={Boolean(errors.description)}
            className={cn(
              "flex w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm",
              "placeholder:text-muted-foreground",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              errors.description && "border-destructive focus:ring-destructive/50"
            )}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-muted-foreground">10–2000 characters</p>
            <p className="text-xs text-muted-foreground">{description.trim().length}/2000</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="country">
            <Input
              label="Country"
              required
              placeholder="e.g. India"
              error={errors.country?.message}
              {...register("country")}
            />
          </div>

          <div data-field="website">
            <Input
              label="Website"
              type="text"
              inputMode="url"
              placeholder="https://www.example.com"
              error={errors.website?.message}
              {...register("website")}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="Active"
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
              />
            )}
          />
          <Controller
            name="is_popular"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="Popular"
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
              />
            )}
          />
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="Featured"
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
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
