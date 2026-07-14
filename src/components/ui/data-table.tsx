"use client";

import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortOrder } from "@/types/api";
import { cn } from "@/utils/cn";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, ThHTMLAttributes } from "react";

/** Scroll container + ledger styling for admin data tables. */
export function DataTable({
  children,
  minWidthClassName = "min-w-[48rem]",
  className,
}: {
  children: ReactNode;
  minWidthClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("ledger-table w-full text-sm", minWidthClassName)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeadRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-border", className)} {...props} />
  );
}

export function TableHeadCell({
  className,
  align = "left",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6",
        align === "left" && "text-left",
        align === "center" && "text-center px-3 sm:px-4",
        align === "right" && "text-right",
        className
      )}
      {...props}
    />
  );
}

export function SortableTableHead<T extends string>({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  className,
}: {
  label: string;
  column: T;
  sortBy: T | null;
  sortOrder: SortOrder;
  onSort: (column: T) => void;
  className?: string;
}) {
  const isActive = sortBy === column;

  return (
    <th className={cn("px-4 py-2.5 text-left font-medium sm:px-6", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md transition-colors",
          "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          isActive ? "text-primary" : "text-foreground"
        )}
        aria-sort={
          isActive ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )
        ) : (
          <ArrowUpDown
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
            aria-hidden
          />
        )}
      </button>
    </th>
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(function TableRow({ className, ...props }, ref) {
  return <tr ref={ref} className={cn("group", className)} {...props} />;
});

export function TableCell({
  className,
  align = "left",
  ...props
}: HTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 sm:px-6",
        align === "center" && "text-center px-3 sm:px-4",
        align === "right" && "text-right",
        className
      )}
      {...props}
    />
  );
}

/** Translucent loader over an existing table while refetching. */
export function TableLoadingOverlay({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <Loader size="lg" />
        </div>
      ) : null}
    </div>
  );
}

/** Generic skeleton rows for ledger tables. */
export function TableRowsSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-2.5 sm:px-6">
              <Skeleton className="h-4 w-full max-w-[8rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
