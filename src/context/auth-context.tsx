"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLE_DASHBOARD_MAP } from "@/config/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { authService } from "@/services/auth.service";
import type { LoginCredentials, User, UserRole } from "@/types/auth";

interface StoredAuth {
  user: User;
  token: string;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_CHANGE_EVENT = "tradehub-auth-change";

let cachedRaw: string | null | undefined;
let cachedSnapshot: StoredAuth | null = null;

function readRawAuth(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.auth);
}

function updateAuthCache(): StoredAuth | null {
  const raw = readRawAuth();

  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  cachedSnapshot = raw ? (JSON.parse(raw) as StoredAuth) : null;
  return cachedSnapshot;
}

function getAuthSnapshot(): StoredAuth | null {
  return updateAuthCache();
}

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

function subscribeAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => {
    updateAuthCache();
    onStoreChange();
  };

  window.addEventListener(AUTH_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function persistAuth(auth: StoredAuth) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(auth);
  localStorage.setItem(STORAGE_KEYS.auth, raw);
  cachedRaw = raw;
  cachedSnapshot = auth;
}

function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.auth);
  cachedRaw = null;
  cachedSnapshot = null;
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

  const user = stored?.user ?? null;
  const token = stored?.token ?? null;

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      persistAuth({
        user: response.user,
        token: response.token,
      });

      emitAuthChange();
      toast.success(`Welcome back, ${response.user.name}!`);
      router.replace(ROLE_DASHBOARD_MAP[response.user.role]);
    },
    [router]
  );

  const logout = useCallback(async () => {
    const currentToken = getAuthSnapshot()?.token;
    try {
      if (currentToken) {
        await authService.logout();
      }
    } finally {
      clearAuth();
      emitAuthChange();
      toast.success("Logged out successfully");
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      token,
      loading: !hydrated,
      isAuthenticated: !!user && !!token,
      login,
      logout,
    }),
    [user, token, hydrated, login, logout]
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
