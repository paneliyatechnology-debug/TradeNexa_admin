"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  className,
}: ModalProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/45 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-md max-h-[min(92vh,44rem)] flex-col overflow-hidden rounded-lg border border-border bg-card",
          "shadow-[var(--shadow-modal)]",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        role="dialog"
        aria-modal
        aria-labelledby={title ? "modal-title" : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            {title && (
              <h2 id="modal-title" className="text-base font-semibold leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 -mr-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {children && (
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden",
              footer ? "overflow-y-auto px-4 py-4 sm:px-5" : ""
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <div className="shrink-0 border-t border-border bg-card px-4 py-3.5 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
