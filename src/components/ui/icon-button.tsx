"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { forwardRef, type ReactNode } from "react";

export type IconButtonTone =
  | "neutral"
  | "view"
  | "success"
  | "warning"
  | "danger";

const toneStyles: Record<IconButtonTone, string> = {
  neutral:
    "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border",
  view:
    "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
  success:
    "border-success/25 bg-success/10 text-success hover:bg-success/15 hover:border-success/40",
  warning:
    "border-warning/25 bg-warning/10 text-warning hover:bg-warning/15 hover:border-warning/40",
  danger:
    "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:border-destructive/40",
};

export interface IconButtonProps extends Omit<ButtonProps, "size" | "variant" | "children"> {
  label: string;
  tone?: IconButtonTone;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      tone = "neutral",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <Tooltip label={label} disabled={disabled}>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          aria-label={label}
          className={cn(
            "h-8 w-8 shrink-0 rounded-md border shadow-none",
            toneStyles[tone],
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </Tooltip>
    );
  }
);

IconButton.displayName = "IconButton";
