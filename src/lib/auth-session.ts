import { STORAGE_KEYS } from "@/constants/storage-keys";
import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/constants/auth-tokens";
import type { User } from "@/types/auth";
import { isJwtExpired } from "@/utils/jwt";

export const AUTH_CHANGE_EVENT = "tradehub-auth-change";

export interface StoredAuth {
  user: User;
  token: string;
  refreshToken?: string;
}

let cachedRaw: string | null | undefined;
let cachedSnapshot: StoredAuth | null = null;
let refreshPromise: Promise<string | null> | null = null;

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

export function getStoredAuth(): StoredAuth | null {
  return updateAuthCache();
}

export function getAuthSnapshot(): StoredAuth | null {
  return updateAuthCache();
}

export function getAuthToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredAuth()?.refreshToken ?? null;
}

export function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function subscribeAuth(onStoreChange: () => void) {
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

export function persistAuth(auth: StoredAuth) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(auth);
  localStorage.setItem(STORAGE_KEYS.auth, raw);
  cachedRaw = raw;
  cachedSnapshot = auth;
}

export function updateAuthTokens(token: string, refreshToken: string) {
  const current = getStoredAuth();
  if (!current) return;

  persistAuth({
    ...current,
    token,
    refreshToken,
  });
  emitAuthChange();
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.auth);
  cachedRaw = null;
  cachedSnapshot = null;
}

export async function tryRefreshAccessToken(
  refreshFn: (refreshToken: string) => Promise<{ token: string; refreshToken: string }>
): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const stored = getStoredAuth();
    const refreshToken = stored?.refreshToken;

    if (!stored || !refreshToken) {
      return null;
    }

    if (isJwtExpired(refreshToken)) {
      clearAuth();
      emitAuthChange();
      return null;
    }

    try {
      const tokens = await refreshFn(refreshToken);
      updateAuthTokens(tokens.token, tokens.refreshToken);
      return tokens.token;
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status?: number }).status
          : undefined;

      if (status === 401 || status === 403) {
        clearAuth();
        emitAuthChange();
      }

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function isRefreshTokenExpired(): boolean {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return true;
  return isJwtExpired(refreshToken);
}

export function shouldRefreshAccessToken(): boolean {
  const accessToken = getAuthToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) return false;
  if (isJwtExpired(refreshToken)) return false;

  return isJwtExpired(accessToken, ACCESS_TOKEN_REFRESH_BUFFER_MS);
}

export async function ensureValidAccessToken(
  refreshFn: (refreshToken: string) => Promise<{ token: string; refreshToken: string }>
): Promise<boolean> {
  const stored = getStoredAuth();
  if (!stored?.token || !stored.refreshToken) return false;

  if (isJwtExpired(stored.refreshToken)) {
    clearAuth();
    emitAuthChange();
    return false;
  }

  if (!shouldRefreshAccessToken()) {
    return true;
  }

  const newToken = await tryRefreshAccessToken(refreshFn);
  if (newToken) {
    return true;
  }

  const latest = getStoredAuth();
  return Boolean(latest?.token && !isJwtExpired(latest.token));
}
