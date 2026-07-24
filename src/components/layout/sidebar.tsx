"use client";

import { Logo } from "@/components/common/logo";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";
import { getNavItemsForRole, LOGOUT_ITEM } from "@/config/navigation";
import { ROLE_BASE_MAP } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import type { UserRole } from "@/types/auth";
import { cn } from "@/utils/cn";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support",
};

function initialsFromName(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Sidebar() {
  const { user, role, logout } = useAuth();
  const { isOpen, isCollapsed, close, toggleCollapse } = useSidebar();
  const pathname = usePathname();

  if (!user || !role) return null;

  const basePath = ROLE_BASE_MAP[role];
  const navItems = getNavItemsForRole(role).map((item) => ({
    ...item,
    href: `${basePath}/${item.slug}`,
  }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Admin";
  const roleLabel = ROLE_LABEL[role];

  const sidebarContent = (
    <>
      {/* Brand */}
      <div
        className={cn(
          "relative shrink-0 border-b border-sidebar-border/80",
          isCollapsed ? "px-2 py-3" : "px-3 py-3.5"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "flex-col gap-2" : "justify-between gap-2"
          )}
        >
          <SidebarTooltip label="Dashboard" enabled={isCollapsed}>
            <Link
              href={`${basePath}/dashboard`}
              onClick={close}
              className={cn(
                "group flex min-w-0 items-center rounded-lg bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.06)]",
                "ring-1 ring-white/10 transition-shadow duration-150",
                "hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isCollapsed ? "w-full justify-center p-1.5" : "px-2.5 py-2"
              )}
            >
              <Logo variant={isCollapsed ? "collapsed" : "sidebar"} priority />
            </Link>
          </SidebarTooltip>

          {!isCollapsed && (
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={close}
            className="absolute top-2 right-1.5 rounded-md p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex min-h-0 flex-1 flex-col">
        {!isCollapsed && (
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/80">
            Navigation
          </p>
        )}

        <nav
          className={cn(
            "sidebar-nav-scroll flex-1 min-h-0 space-y-0.5 overflow-x-hidden overflow-y-auto",
            isCollapsed ? "px-2 py-2" : "px-2.5 pb-3"
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <SidebarTooltip
                key={item.slug}
                label={item.label}
                enabled={isCollapsed}
              >
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[0.55rem] text-[13px] font-medium",
                    "transition-[background-color,color,box-shadow] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    active
                      ? "bg-primary/18 text-white shadow-[inset_0_0_0_1px_rgba(14,124,107,0.45)]"
                      : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {active && (
                    <span
                      className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full bg-primary"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/[0.04] text-sidebar-muted group-hover:bg-white/[0.07] group-hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {!isCollapsed && (
                    <span className="truncate leading-tight">{item.label}</span>
                  )}
                </Link>
              </SidebarTooltip>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 space-y-2 border-t border-sidebar-border/80",
          isCollapsed ? "p-2" : "p-2.5"
        )}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-2.5 py-2 ring-1 ring-white/[0.06]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary-foreground ring-1 ring-primary/30">
              {initialsFromName(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-sidebar-muted">
                {roleLabel}
              </p>
            </div>
          </div>
        ) : (
          <SidebarTooltip label={displayName} enabled>
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary-foreground ring-1 ring-primary/30">
              {initialsFromName(displayName)}
            </div>
          </SidebarTooltip>
        )}

        <SidebarTooltip label={LOGOUT_ITEM.label} enabled={isCollapsed}>
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
              "text-sidebar-muted transition-colors duration-150",
              "hover:bg-destructive/15 hover:text-red-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LOGOUT_ITEM.icon className="h-4 w-4 shrink-0" aria-hidden />
            {!isCollapsed && <span>{LOGOUT_ITEM.label}</span>}
          </button>
        </SidebarTooltip>

        <SidebarTooltip
          label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          enabled={isCollapsed}
        >
          <button
            type="button"
            onClick={toggleCollapse}
            className={cn(
              "hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium lg:flex",
              "text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isCollapsed && "justify-center px-2"
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
        </SidebarTooltip>
      </div>
    </>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] animate-in fade-in duration-200 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "relative fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col",
          "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "shadow-[4px_0_24px_rgba(11,31,42,0.12)]",
          "transition-[width,transform] duration-200 ease-out",
          "lg:static lg:h-screen lg:max-h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-[15.5rem]"
        )}
      >
        {/* Subtle depth wash — not a loud gradient theme */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,124,107,0.08),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative flex h-full min-h-0 flex-col">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
