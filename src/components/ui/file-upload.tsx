"use client";

import { cn } from "@/utils/cn";
import { ImagePlus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

interface FileUploadProps {
  label: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  formats?: string;
  hint?: string;
  error?: string;
  variant?: "default" | "compact";
}

export function FileUpload({
  label,
  value = null,
  onChange,
  accept = "image/*",
  formats = "PNG, JPG, WEBP",
  hint,
  error,
  variant = "default",
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isCompact = variant === "compact";
  const boxHeight = isCompact ? "h-32" : "h-40";

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
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
            : "border-dashed border-border hover:border-primary/40 hover:bg-primary/5",
          error && "border-destructive"
        )}
      >
        {previewUrl ? (
          <div className="group relative h-full w-full">
            <button
              type="button"
              onClick={openFilePicker}
              className="relative h-full w-full cursor-pointer"
              aria-label={`Change ${label}`}
            >
              <Image
                src={previewUrl}
                alt={`${label} preview`}
                fill
                unoptimized
                className="object-contain p-3 pb-10"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
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
              <p className="truncate text-xs text-muted-foreground">{value?.name}</p>
            </div>
          </div>
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
