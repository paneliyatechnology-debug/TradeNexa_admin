"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

interface BannerDropdownProps {
  label: string;
  placeholder: string;
  selectedLabel: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
}

export function BannerDropdown({
  label,
  placeholder,
  selectedLabel,
  open,
  onOpenChange,
  error,
  disabled = false,
  children,
}: BannerDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    bottom: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      bottom: window.innerHeight - rect.top + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onOpenChange(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background/50 px-4 text-left text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-destructive focus:ring-destructive/50"
        )}
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {mounted && open && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[200] overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              style={{
                bottom: menuPosition.bottom,
                left: menuPosition.left,
                width: menuPosition.width,
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export function BannerDropdownMenu({
  onScroll,
  children,
}: {
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  children: ReactNode;
}) {
  return (
    <div onScroll={onScroll} className="max-h-56 overflow-y-auto p-1">
      {children}
    </div>
  );
}
