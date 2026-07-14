import { cn } from "@/utils/cn";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, required = false, error, hint, id, rows = 4, ...props },
    ref
  ) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[13px] font-medium text-foreground"
          >
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-card px-3 py-2.5 text-sm",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive focus:border-destructive focus:ring-destructive/40",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
