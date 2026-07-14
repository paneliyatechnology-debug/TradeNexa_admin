"use client";

import { cn } from "@/utils/cn";

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Accessible name for the chip group */
  "aria-label"?: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Filters",
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium sm:text-[13px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-primary/30 bg-primary text-primary-foreground"
                : "border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type TriState = "all" | "yes" | "no";

const TRI_STATE_OPTIONS: FilterChipOption<TriState>[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/** Labeled All/Yes/No filter used on brands and similar screens. */
export function BoolFilterGroup({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
  className?: string;
}) {
  const isFiltered = value !== "all";

  return (
    <div
      className={cn(
        "rounded-md border p-3",
        isFiltered
          ? "border-primary/30 bg-accent"
          : "border-border bg-secondary/60",
        className
      )}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-card p-1">
        {TRI_STATE_OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs font-medium sm:text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { TriState as BoolFilterValue };
