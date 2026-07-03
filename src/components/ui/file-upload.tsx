"use client";

import { cn } from "@/utils/cn";
import { resolveMediaPreviewUrl, resolveMediaUrl } from "@/utils/media-url";
import { ImagePlus, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface FileUploadProps {
  label: string;
  required?: boolean;
  value?: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
  onRemoveExisting?: () => void;
  accept?: string;
  formats?: string;
  hint?: string;
  error?: string;
  variant?: "default" | "compact";
}

export function FileUpload({
  label,
  required = false,
  value = null,
  onChange,
  existingUrl = null,
  onRemoveExisting,
  accept = "image/*",
  formats = "PNG, JPG, WEBP",
  hint,
  error,
  variant = "default",
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dismissedExisting, setDismissedExisting] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [existingPreviewSrc, setExistingPreviewSrc] = useState<string | null>(null);
  const isCompact = variant === "compact";
  const boxHeight = isCompact ? "h-32" : "h-40";

  const directExistingUrl = resolveMediaUrl(existingUrl);
  const proxyExistingUrl = resolveMediaPreviewUrl(existingUrl);

  useEffect(() => {
    setDismissedExisting(false);
    setPreviewError(false);
    setExistingPreviewSrc(directExistingUrl);
  }, [existingUrl, directExistingUrl]);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    setPreviewError(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const resolvedExistingUrl = existingPreviewSrc;
  const displayUrl =
    previewUrl ?? (dismissedExisting ? null : resolvedExistingUrl) ?? null;

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setDismissedExisting(false);
    }
    onChange(file);
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (value) {
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    if (existingUrl) {
      setDismissedExisting(true);
      onRemoveExisting?.();
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleFileChange}
      />

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border bg-muted/15 transition-colors",
          boxHeight,
          previewUrl
            ? "border-border"
            : displayUrl
              ? "border-border"
              : "border-dashed border-border hover:border-primary/40 hover:bg-primary/5",
          error && "border-destructive"
        )}
      >
        {displayUrl && !previewError ? (
          <div className="group relative h-full w-full">
            <button
              type="button"
              onClick={openFilePicker}
              className="relative block h-full w-full cursor-pointer overflow-hidden"
              aria-label={`Change ${label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={`${label} preview`}
                className="h-full w-full object-contain p-3 pb-10"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (
                    existingPreviewSrc === directExistingUrl &&
                    proxyExistingUrl &&
                    directExistingUrl !== proxyExistingUrl
                  ) {
                    setExistingPreviewSrc(proxyExistingUrl);
                    setPreviewError(false);
                    return;
                  }
                  setPreviewError(true);
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </button>

            <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-background/90 px-2 py-1 text-[10px] font-medium text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              Click to change
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-background/90 text-foreground shadow-sm hover:bg-background"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border/80 bg-background/90 px-3 py-2">
              <p className="truncate text-xs text-muted-foreground">
                {value?.name ?? (resolvedExistingUrl ? "Current file" : "")}
              </p>
            </div>
          </div>
        ) : displayUrl && previewError ? (
          <button
            type="button"
            onClick={openFilePicker}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <p className="text-sm font-medium text-muted-foreground">Preview unavailable</p>
            <p className="text-xs text-muted-foreground">Click to upload a new {label.toLowerCase()}</p>
          </button>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            className={cn(
              "flex h-full w-full text-left transition-colors",
              isCompact
                ? "items-center gap-3 px-3"
                : "flex-col items-center justify-center gap-2 px-4 text-center"
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
                isCompact ? "h-9 w-9" : "h-10 w-10 rounded-full"
              )}
            >
              {isCompact ? (
                <Upload className="h-4 w-4" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>
            <div className={cn(isCompact ? "min-w-0 flex-1" : "")}>
              <p className="text-sm font-medium">Upload {label.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground">{formats}</p>
            </div>
          </button>
        )}
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
