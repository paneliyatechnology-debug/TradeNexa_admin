"use client";

import { cn } from "@/utils/cn";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarTooltipProps {
  label: string;
  enabled: boolean;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarTooltip({
  label,
  enabled,
  badge,
  children,
  className,
}: SidebarTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!enabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
    setVisible(true);
  }, [enabled]);

  const hide = useCallback(() => setVisible(false), []);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn("w-full", className)}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className={cn(
              "fixed z-[200] flex items-center gap-2 -translate-y-1/2",
              "px-2.5 py-1.5 rounded-md text-[12px] font-medium",
              "bg-[color:var(--ink)] text-[color:var(--ink-foreground)] shadow-[var(--shadow-modal)] border border-[color:var(--ink)]",
              "pointer-events-none whitespace-nowrap",
              "animate-in fade-in slide-in-from-left-1 duration-150"
            )}
          >
            <span>{label}</span>
            {badge && (
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-normal">
                {badge}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
