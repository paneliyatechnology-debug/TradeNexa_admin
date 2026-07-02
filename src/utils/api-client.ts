import type { ApiResponse } from "@/types/api";
import { getAuthToken } from "@/utils/auth-token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
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

function buildAuthHeaders(token?: string | null): Record<string, string> {
  const resolvedToken = token ?? getAuthToken();
  return resolvedToken ? { Authorization: resolvedToken } : {};
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

export async function apiClientGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  token?: string | null
): Promise<T> {
  const url = `${path}${buildQuery(params)}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: buildAuthHeaders(token),
  });
  return parseApiResponse<T>(response);
}

export async function apiClientPost<T>(
  path: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(token),
  };

  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return parseApiResponse<T>(response);
}

export async function apiClientPostFormData<T>(
  path: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: buildAuthHeaders(token),
    body: formData,
    cache: "no-store",
  });

  return parseApiResponse<T>(response);
}
