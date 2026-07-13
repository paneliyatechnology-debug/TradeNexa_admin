import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiPagination } from "@/types/api";

interface PaginationProps {
  pagination: ApiPagination;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  pagination,
  onPageChange,
  className,
}: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        "flex flex-col items-stretch justify-between gap-2.5 pt-3 sm:flex-row sm:items-center",
        className
      )}
    >
      <p className="text-center text-[13px] text-muted-foreground sm:text-left font-data">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-w-9 flex-1 sm:min-w-0 sm:flex-none"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="shrink-0 px-1 text-[13px] text-muted-foreground font-data sm:px-2">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-w-9 flex-1 sm:min-w-0 sm:flex-none"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
