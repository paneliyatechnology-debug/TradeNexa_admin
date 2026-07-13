"use client";

import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_COLORS, ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/utils/cn";
import { Bell, Menu } from "lucide-react";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { toggle } = useSidebar();
  const { role, isPreviewRole } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggle}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {title && (
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <RoleSwitcher />

        {role && (
          <Badge className={cn("hidden sm:inline-flex", ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
            {isPreviewRole ? " (preview)" : ""}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>

        <ProfileDropdown />
      </div>
    </header>
  );
}
