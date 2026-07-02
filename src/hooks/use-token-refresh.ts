"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TOKEN_CHECK_INTERVAL_MS } from "@/constants/auth-tokens";
import {
  clearAuth,
  emitAuthChange,
  ensureValidAccessToken,
  getStoredAuth,
  isRefreshTokenExpired,
} from "@/lib/auth-session";
import { authService } from "@/services/auth.service";

export function useTokenRefresh(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const refreshFn = (refreshToken: string) => authService.refreshToken(refreshToken);

    const checkTokens = async () => {
      const stored = getStoredAuth();
      if (!stored) return;

      if (isRefreshTokenExpired()) {
        clearAuth();
        emitAuthChange();
        toast.error("Your session has expired after 7 days. Please log in again.");
        router.replace("/login");
        return;
      }

      const isValid = await ensureValidAccessToken(refreshFn);
      if (!isValid && !getStoredAuth()) {
        toast.error("Your session has expired. Please log in again.");
        router.replace("/login");
      }
    };

    const interval = setInterval(() => {
      void checkTokens();
    }, TOKEN_CHECK_INTERVAL_MS);

    const handleFocus = () => {
      void checkTokens();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, router]);
}
