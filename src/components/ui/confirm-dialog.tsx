"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "destructive" | "warning";
  icon?: ReactNode;
  preview?: ReactNode;
  className?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  variant = "destructive",
  icon,
  preview,
  className,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const isDestructive = variant === "destructive";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[color:var(--ink)]/45 animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-modal)]",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-5 pb-5 pt-7 text-center sm:px-6">
          <div
            className={cn(
              "mx-auto flex h-12 w-12 items-center justify-center rounded-md border",
              isDestructive
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-warning/25 bg-warning/10 text-warning"
            )}
          >
            {icon ?? (
              <AlertTriangle
                className={cn(
                  "h-6 w-6",
                  isDestructive ? "text-destructive" : "text-warning"
                )}
              />
            )}
          </div>

          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>

          {preview ? <div className="mt-4">{preview}</div> : null}

          {description ? (
            <div className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-9 flex-1 sm:max-w-[9.5rem]"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={isDestructive ? "danger" : "primary"}
              loading={loading}
              onClick={() => void onConfirm()}
              className="h-9 flex-1 sm:max-w-[9.5rem]"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
