"use client";

import { cn } from "@/utils/cn";
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  label,
  children,
  side = "top",
  className,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const show = useCallback(() => {
    if (disabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    let top = rect.top;
    let left = rect.left + rect.width / 2;

    if (side === "top") {
      top = rect.top - gap;
    } else if (side === "bottom") {
      top = rect.bottom + gap;
    } else if (side === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - gap;
    } else {
      top = rect.top + rect.height / 2;
      left = rect.right + gap;
    }

    setCoords({ top, left });
    setVisible(true);
  }, [disabled, side]);

  const hide = useCallback(() => setVisible(false), []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? tooltipId : undefined}
      >
        {children}
      </span>
      {visible
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              style={{ top: coords.top, left: coords.left }}
              className={cn(
                "fixed z-[220] pointer-events-none whitespace-nowrap",
                "rounded-md border border-[color:var(--ink)] bg-[color:var(--ink)] px-2 py-1",
                "text-[11px] font-medium text-[color:var(--ink-foreground)] shadow-[var(--shadow-modal)]",
                "animate-in fade-in duration-150",
                side === "top" && "-translate-x-1/2 -translate-y-full",
                side === "bottom" && "-translate-x-1/2",
                side === "left" && "-translate-x-full -translate-y-1/2",
                side === "right" && "-translate-y-1/2"
              )}
            >
              {label}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
