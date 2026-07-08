import type { ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import {
  clearAuth,
  emitAuthChange,
  getAuthToken,
  tryRefreshAccessToken,
} from "@/lib/auth-session";
import { authService } from "@/services/auth.service";
import { buildAuthorizationHeader } from "@/utils/auth-header";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiRequestOptions {
  /** When true, throws if no access token is available. Defaults to true. */
  requireAuth?: boolean;
  /**
   * Internal flag: set after one automatic retry following a successful token refresh.
   * Prevents infinite refresh loops when the retried request still returns 401.
   */
  _retriedAfterRefresh?: boolean;
}

/** Auth routes must never trigger the refresh interceptor (avoids refresh loops). */
const AUTH_SKIP_REFRESH_PATHS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.logout,
] as const;

function shouldSkipTokenRefresh(url: string): boolean {
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

/** Ensures logout + redirect happen only once when concurrent requests all fail refresh. */
let sessionExpiryRedirectStarted = false;

function handleSessionExpired(): void {
  if (typeof window === "undefined") return;

  clearAuth();
  emitAuthChange();

  if (sessionExpiryRedirectStarted || window.location.pathname === ROUTES.login) {
    return;
  }

  sessionExpiryRedirectStarted = true;
  window.location.replace(ROUTES.login);
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildAuthHeaders(token: string | null): Record<string, string> {
  return buildAuthorizationHeader(token);
}

async function resolveAccessToken(requireAuth: boolean): Promise<string | null> {
  const token = getAuthToken();
  if (requireAuth && !token) {
    throw new ApiError("You must be logged in to perform this action.", 401);
  }

  return token;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  let json: ApiResponse<T>;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  if (!response.ok) {
    throw new ApiError(json.message || `Request failed with status ${response.status}`, response.status);
  }

  if (!json.success) {
    throw new ApiError(json.message || "Request failed");
  }

  return json.data;
}

async function fetchWithAuthRetry(
  url: string,
  init: RequestInit,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const requireAuth = options.requireAuth ?? true;
  const alreadyRetried = options._retriedAfterRefresh ?? false;

  const send = async (token: string | null) =>
    fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        ...init.headers,
        ...buildAuthHeaders(token),
      },
    });

  let token = await resolveAccessToken(requireAuth);
  let response = await send(token);

  const canAttemptRefresh =
    response.status === 401 &&
    requireAuth &&
    !shouldSkipTokenRefresh(url);

  if (canAttemptRefresh) {
    // Stop infinite loops: each original request may be retried only once after refresh.
    if (alreadyRetried) {
      handleSessionExpired();
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    // Concurrent 401s share one in-flight refresh via tryRefreshAccessToken (auth-session).
    const newToken = await tryRefreshAccessToken((refreshToken) =>
      authService.refreshToken(refreshToken)
    );

    if (newToken) {
      // Retry with the new access token; preserve original method, headers, and body.
      return fetchWithAuthRetry(url, init, {
        ...options,
        _retriedAfterRefresh: true,
      });
    }

    // Refresh failed (expired/invalid refresh token) — clear session and redirect.
    handleSessionExpired();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (response.status === 401) {
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  return response;
}

export async function apiClientGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: ApiRequestOptions
): Promise<T> {
  const url = `${path}${buildQuery(params)}`;
  const response = await fetchWithAuthRetry(url, { method: "GET" }, options);
  return parseApiResponse<T>(response);
}

export async function apiClientPost<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    options
  );

  return parseApiResponse<T>(response);
}

export async function apiClientPut<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(
    path,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    options
  );

  return parseApiResponse<T>(response);
}

export async function apiClientPatch<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    options
  );

  return parseApiResponse<T>(response);
}

export async function apiClientDelete<T>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(path, { method: "DELETE" }, options);
  return parseApiResponse<T>(response);
}

export async function apiClientPutFormData<T>(
  path: string,
  formData: FormData,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(
    path,
    {
      method: "PUT",
      body: formData,
    },
    options
  );

  return parseApiResponse<T>(response);
}

export async function apiClientPostFormData<T>(
  path: string,
  formData: FormData,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetchWithAuthRetry(
    path,
    {
      method: "POST",
      body: formData,
    },
    options
  );

  return parseApiResponse<T>(response);
}
