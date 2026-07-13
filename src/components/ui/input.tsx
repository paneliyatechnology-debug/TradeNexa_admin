import { cn } from "@/utils/cn";
import { forwardRef, type InputHTMLAttributes, type MouseEvent } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

function openDatePicker(input: HTMLInputElement) {
  if (typeof input.showPicker !== "function") return;

  try {
    input.showPicker();
  } catch {
    // Some browsers reject showPicker outside a direct user gesture.
  }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, required = false, error, hint, id, type, onClick, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isDateInput = type === "date";

    const handleClick = (event: MouseEvent<HTMLInputElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && isDateInput) {
        openDatePicker(event.currentTarget);
      }
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-[13px] font-medium text-foreground",
              isDateInput && "cursor-pointer"
            )}
            onClick={() => {
              if (!isDateInput || !inputId) return;

              const input = document.getElementById(inputId);
              if (input instanceof HTMLInputElement) {
                openDatePicker(input);
              }
            }}
          >
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-required={required || undefined}
          onClick={handleClick}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isDateInput && [
              "relative cursor-pointer",
              "[&::-webkit-calendar-picker-indicator]:absolute",
              "[&::-webkit-calendar-picker-indicator]:inset-0",
              "[&::-webkit-calendar-picker-indicator]:h-full",
              "[&::-webkit-calendar-picker-indicator]:w-full",
              "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
              "[&::-webkit-calendar-picker-indicator]:opacity-0",
            ],
            error && "border-destructive focus:ring-destructive/40 focus:border-destructive",
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

Input.displayName = "Input";
