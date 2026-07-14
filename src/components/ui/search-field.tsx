"use client";

import { cn } from "@/utils/cn";
import { Search } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, containerClassName, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative w-full sm:max-w-md", containerClassName)}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          disabled={disabled}
          className={cn(
            "h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchField.displayName = "SearchField";
