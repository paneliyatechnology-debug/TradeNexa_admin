"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROLE_DASHBOARD_MAP } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";

interface ErrorPageProps {
  code: string;
  title: string;
  description: string;
  showHome?: boolean;
  showBack?: boolean;
}

export function ErrorPage({
  code,
  title,
  description,
  showHome = true,
  showBack = true,
}: ErrorPageProps) {
  const { isAuthenticated, role } = useAuth();
  const homeHref =
    isAuthenticated && role ? ROLE_DASHBOARD_MAP[role] : "/login";
  const homeLabel = isAuthenticated ? "Go to dashboard" : "Back to sign in";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <p className="font-data text-6xl font-semibold tracking-tight text-primary">
          {code}
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          {showBack && (
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
          )}
          {showHome && (
            <Link href={homeHref}>
              <Button>{homeLabel}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
