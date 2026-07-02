"use client";

import { GuestGuard } from "@/components/common/route-guard";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPageClient() {
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 lg:p-6 login-mesh">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm">
            <CardHeader className="text-center sm:text-left pb-4">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
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
