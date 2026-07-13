"use client";

import { Badge } from "@/components/ui/badge";
import { ROLE_SWITCHER_ENABLED } from "@/lib/preview-role";
import { ALL_USER_ROLES, ROLE_COLORS, ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";
import { cn } from "@/utils/cn";
import { Users } from "lucide-react";

export function RoleSwitcher() {
  const { role, actualRole, isPreviewRole, switchPreviewRole, resetPreviewRole, isAuthenticated } =
    useAuth();

  if (!ROLE_SWITCHER_ENABLED || !isAuthenticated || !role || !actualRole) {
    return null;
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <label htmlFor="role-switcher" className="sr-only">
        Switch admin panel role
      </label>
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <select
          id="role-switcher"
          value={role}
          onChange={(event) => {
            const nextRole = event.target.value as UserRole;

            if (nextRole === actualRole) {
              resetPreviewRole();
              return;
            }

            switchPreviewRole(nextRole);
          }}
          className={cn(
            "h-8 min-w-[9.5rem] rounded-md border-0 bg-transparent pr-6 text-[13px] font-medium",
            "focus:outline-none focus:ring-2 focus:ring-ring/40"
          )}
        >
          {ALL_USER_ROLES.map((item) => (
            <option key={item} value={item}>
              {ROLE_LABELS[item]}
              {item === actualRole ? " (login)" : ""}
            </option>
          ))}
        </select>
        {isPreviewRole ? (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            Preview
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
