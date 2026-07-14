"use client";

import { Logo } from "@/components/common/logo";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";
import { getNavItemsForRole, LOGOUT_ITEM } from "@/config/navigation";
import { ROLE_BASE_MAP } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/utils/cn";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const sidebarContent = (
    <>
      <div
        className={cn(
          "shrink-0 flex items-center border-b border-sidebar-border",
          isCollapsed
            ? "flex-col justify-center gap-1 px-2 py-3 min-h-[88px]"
            : "h-14 justify-between px-3"
        )}
      >
        <SidebarTooltip label="Dashboard" enabled={isCollapsed}>
          <Link
            href={`${basePath}/dashboard`}
            className={cn(
              "flex items-center min-w-0 rounded-md bg-card px-2 py-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsed ? "w-full justify-center px-1.5" : ""
            )}
            onClick={close}
          >
            <Logo variant={isCollapsed ? "collapsed" : "sidebar"} priority />
          </Link>
        </SidebarTooltip>
        {!isCollapsed && (
          <button
            onClick={close}
            className="lg:hidden rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isCollapsed && (
        <button
          onClick={close}
          className="absolute top-3 right-2 rounded-md p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <nav className="sidebar-nav-scroll flex-1 min-h-0 space-y-0.5 overflow-x-hidden overflow-y-auto p-2.5">
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
                  "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  active
                    ? "bg-primary text-primary-foreground before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[3px] before:rounded-r-sm before:bg-primary-foreground/90"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
                  isCollapsed && "justify-center px-2 before:hidden"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!isCollapsed && (
                  <span className="truncate leading-tight">{item.label}</span>
                )}
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-sidebar-border p-2.5">
        <SidebarTooltip label={LOGOUT_ITEM.label} enabled={isCollapsed}>
          <button
            onClick={() => {
              close();
              logout();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
              "text-sidebar-muted transition-colors duration-150 hover:bg-destructive/15 hover:text-red-300",
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
            onClick={toggleCollapse}
            className={cn(
              "hidden w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium lg:flex",
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
          className="fixed inset-0 z-40 bg-ink/40 animate-in fade-in duration-200 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "relative fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          "lg:static lg:h-screen lg:max-h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[68px]" : "w-56"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
