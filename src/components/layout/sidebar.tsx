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
          "shrink-0 flex items-center border-b border-[color:var(--sidebar-border)]",
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
              isCollapsed ? "justify-center w-full px-1.5" : "px-2"
            )}
            onClick={close}
          >
            <Logo variant={isCollapsed ? "collapsed" : "sidebar"} priority />
          </Link>
        </SidebarTooltip>
        {!isCollapsed && (
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-md text-[color:var(--sidebar-muted)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isCollapsed && (
        <button
          onClick={close}
          className="lg:hidden absolute top-3 right-2 p-1 rounded-md text-[color:var(--sidebar-muted)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-foreground)]"
          aria-label="Close sidebar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <nav className="sidebar-nav-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <SidebarTooltip
              key={item.slug}
              label={item.label}
              enabled={isCollapsed}
              badge={item.comingSoon ? "Soon" : undefined}
            >
              <Link
                href={item.href}
                onClick={close}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r-sm before:bg-primary-foreground/80"
                    : "text-[color:var(--sidebar-muted)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-foreground)]",
                  isCollapsed && "justify-center px-2 before:hidden"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate leading-tight">{item.label}</span>
                )}
                {!isCollapsed && item.comingSoon === true && (
                  <span
                    className={cn(
                      "ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-sm",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-[color:var(--sidebar-hover)] text-[color:var(--sidebar-muted)]"
                    )}
                  >
                    Soon
                  </span>
                )}
              </Link>
            </SidebarTooltip>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[color:var(--sidebar-border)] p-2.5 space-y-0.5">
        <SidebarTooltip label={LOGOUT_ITEM.label} enabled={isCollapsed}>
          <button
            onClick={() => {
              close();
              logout();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
              "text-[color:var(--sidebar-muted)] hover:bg-destructive/15 hover:text-red-300 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LOGOUT_ITEM.icon className="h-4 w-4 shrink-0" />
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
              "hidden lg:flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium",
              "text-[color:var(--sidebar-muted)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-foreground)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              isCollapsed && "justify-center px-2"
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
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
          className="fixed inset-0 z-40 bg-[color:var(--sidebar)]/60 lg:hidden animate-in fade-in duration-200"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "relative fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] transition-all duration-200",
          "lg:static lg:h-screen lg:max-h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
