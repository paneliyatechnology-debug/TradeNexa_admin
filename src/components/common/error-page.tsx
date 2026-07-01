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
  const homeLabel = isAuthenticated ? "Go to Dashboard" : "Back to Login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-8xl font-bold bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
          {code}
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {showBack && (
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
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
