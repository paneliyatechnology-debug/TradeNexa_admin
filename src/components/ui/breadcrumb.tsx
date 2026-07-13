import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { BreadcrumbItem } from "@/types/navigation";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast && (item.href || item.onClick);

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            {isClickable && item.href ? (
              <Link
                href={item.href}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : isClickable && item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  "text-[13px]",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
