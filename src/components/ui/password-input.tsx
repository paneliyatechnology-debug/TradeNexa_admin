"use client";

import { cn } from "@/utils/cn";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import type { InputProps } from "@/components/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 pr-10 text-sm",
              "placeholder:text-muted-foreground",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-destructive focus:ring-destructive/40 focus:border-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
