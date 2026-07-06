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
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-28 bg-gradient-to-b opacity-80",
            isDestructive
              ? "from-destructive/15 via-destructive/5 to-transparent"
              : "from-amber-500/15 via-amber-500/5 to-transparent"
          )}
        />

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pb-6 pt-8 text-center sm:px-8">
          <div
            className={cn(
              "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm",
              isDestructive
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-amber-500/20 bg-amber-500/10 text-amber-600"
            )}
          >
            {icon ?? (
              <AlertTriangle
                className={cn("h-7 w-7", isDestructive ? "text-destructive" : "text-amber-600")}
              />
            )}
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h2>

          {preview ? <div className="mt-5">{preview}</div> : null}

          {description ? (
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-11 flex-1 rounded-xl sm:max-w-[9.5rem]"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={isDestructive ? "danger" : "primary"}
              loading={loading}
              onClick={() => void onConfirm()}
              className="h-11 flex-1 rounded-xl sm:max-w-[9.5rem]"
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
