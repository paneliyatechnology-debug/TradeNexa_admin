"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_COLORS, ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ProfileDropdown() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user || !role) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors",
          "hover:bg-accent",
          open && "bg-accent"
        )}
      >
        <Avatar name={user.name} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform hidden md:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="px-3 py-2 border-b border-border mb-2">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge className={cn("mt-2", ROLE_COLORS[role])}>
              {ROLE_LABELS[role]}
            </Badge>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
