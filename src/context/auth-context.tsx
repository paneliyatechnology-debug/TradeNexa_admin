"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  clearPreviewRole,
  getPreviewRole,
  setPreviewRole,
  subscribePreviewRole,
} from "@/lib/preview-role";
import { ROLE_DASHBOARD_MAP, ROUTES } from "@/config/routes";
import { useTokenRefresh } from "@/hooks/use-token-refresh";
import {
  clearAuth,
  emitAuthChange,
  getAuthSnapshot,
  isRefreshTokenExpired,
  persistAuth,
  subscribeAuth,
  tryRefreshAccessToken,
} from "@/lib/auth-session";
import { authService } from "@/services/auth.service";
import type { LoginCredentials, User, UserRole } from "@/types/auth";
import { ADMIN_ACCESS_DENIED_MESSAGE } from "@/utils/map-backend-role";

interface AuthContextValue {
  user: User | null;
  /** Effective role used for navigation and route access (preview overrides login role). */
  role: UserRole | null;
  /** Role returned from the backend after login. */
  actualRole: UserRole | null;
  isPreviewRole: boolean;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  switchPreviewRole: (role: UserRole) => void;
  resetPreviewRole: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const stored = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    () => null
  );
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const previewRole = useSyncExternalStore(
    subscribePreviewRole,
    getPreviewRole,
    () => null
  );
  const [sessionReady, setSessionReady] = useState(false);

  const user = stored?.user ?? null;
  const token = stored?.token ?? null;
  const actualRole = user?.role ?? null;
  const role = previewRole ?? actualRole;
  const isPreviewRole = Boolean(previewRole && previewRole !== actualRole);
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    if (!hydrated) return;

    const storedAuth = getAuthSnapshot();
    if (!storedAuth?.token) {
      setSessionReady(true);
      return;
    }

    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const snapshot = getAuthSnapshot();
        if (!snapshot?.token) {
          setSessionReady(true);
          return;
        }

        if (snapshot.refreshToken) {
          if (isRefreshTokenExpired()) {
            clearAuth();
            emitAuthChange();
            toast.error("Your session has expired after 7 days. Please log in again.");
            router.replace(ROUTES.login);
            setSessionReady(true);
            return;
          }

          const refreshFn = (refreshToken: string) => authService.refreshToken(refreshToken);
          const newToken = await tryRefreshAccessToken(refreshFn);
          if (cancelled) return;

          if (!newToken) {
            toast.error("Your session has expired. Please log in again.");
            router.replace(ROUTES.login);
            setSessionReady(true);
            return;
          }
        }

        const currentSnapshot = getAuthSnapshot();
        const accessToken = currentSnapshot?.token ?? snapshot.token;
        const validatedUser = await authService.validateSession(accessToken);
        if (cancelled) return;

        persistAuth({
          ...(currentSnapshot ?? snapshot),
          user: validatedUser,
        });
        emitAuthChange();
        setSessionReady(true);
      } catch (error) {
        if (cancelled) return;

        clearAuth();
        emitAuthChange();

        const message =
          error instanceof Error ? error.message : ADMIN_ACCESS_DENIED_MESSAGE;

        toast.error(message);
        router.replace(
          message === ADMIN_ACCESS_DENIED_MESSAGE
            ? ROUTES.unauthorized
            : ROUTES.login
        );
        setSessionReady(true);
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [hydrated, router]);

  useTokenRefresh(hydrated && isAuthenticated && sessionReady);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login(credentials);
        persistAuth({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        });

        clearPreviewRole();
        emitAuthChange();
        toast.success(`Welcome back, ${response.user.name}!`);
        router.replace(ROLE_DASHBOARD_MAP[response.user.role]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Login failed. Please try again.";

        if (message === ADMIN_ACCESS_DENIED_MESSAGE) {
          toast.error(message);
          router.replace(ROUTES.unauthorized);
          return;
        }

        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    const snapshot = getAuthSnapshot();
    try {
      if (snapshot?.token && snapshot.refreshToken) {
        await authService.logout(snapshot.token, snapshot.refreshToken);
      }
    } finally {
      clearPreviewRole();
      clearAuth();
      emitAuthChange();
      toast.success("Logged out successfully");
      router.replace(ROUTES.login);
    }
  }, [router]);

  const switchPreviewRole = useCallback(
    (nextRole: UserRole) => {
      setPreviewRole(nextRole);
      toast.info(`Previewing ${nextRole.replace("_", " ").toLowerCase()} panel`);
      router.replace(ROLE_DASHBOARD_MAP[nextRole]);
    },
    [router]
  );

  const resetPreviewRole = useCallback(() => {
    if (!actualRole) return;

    clearPreviewRole();
    toast.info("Using your actual login role");
    router.replace(ROLE_DASHBOARD_MAP[actualRole]);
  }, [actualRole, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      actualRole,
      isPreviewRole,
      token,
      loading: !hydrated || !sessionReady,
      isAuthenticated,
      switchPreviewRole,
      resetPreviewRole,
      login,
      logout,
    }),
    [
      user,
      role,
      actualRole,
      isPreviewRole,
      token,
      hydrated,
      sessionReady,
      isAuthenticated,
      switchPreviewRole,
      resetPreviewRole,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
