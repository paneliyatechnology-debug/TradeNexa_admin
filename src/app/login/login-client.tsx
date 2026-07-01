"use client";

import { GuestGuard } from "@/components/common/route-guard";
import { LoginForm } from "@/components/forms/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginPageClient() {
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 lg:p-6 login-mesh">
        <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm">
            <CardHeader className="text-center sm:text-left pb-4">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Demo Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                Use any of the accounts below for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { role: "Super Admin", email: "superadmin@test.com" },
                { role: "Admin", email: "admin@test.com" },
                { role: "Support", email: "support@test.com" },
              ].map(({ role, email }) => (
                <div
                  key={role}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs"
                >
                  <span className="font-medium text-foreground">{role}</span>
                  <span className="text-muted-foreground">
                    {email} / 123456
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
