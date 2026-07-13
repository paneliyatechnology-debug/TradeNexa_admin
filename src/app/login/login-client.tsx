"use client";

import { GuestGuard } from "@/components/common/route-guard";
import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/common/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPageClient() {
  return (
    <GuestGuard>
      <div className="login-page-bg min-h-screen flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-md bg-card px-4 py-2.5">
              <Logo variant="sidebar" priority />
            </div>
          </div>
          <Card className="login-card">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Use your admin account to continue.
              </p>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
