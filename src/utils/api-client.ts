import type { ApiResponse } from "@/types/api";
import {
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

  if (response.status === 401 && requireAuth) {
    const newToken = await tryRefreshAccessToken((refreshToken) =>
      authService.refreshToken(refreshToken)
    );

    if (newToken) {
      token = newToken;
      response = await send(newToken);
    }
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
