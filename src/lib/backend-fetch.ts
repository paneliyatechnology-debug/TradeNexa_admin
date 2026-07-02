import { API_BASE_URL } from "@/config/api";

function getForwardedAuthHeader(request?: Request): string | null {
  if (!request) return null;
  return request.headers.get("Authorization");
}

function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ success: false, message, data: null }, { status: 401 });
}

function requireAuthHeader(request: Request): Response | null {
  if (!getForwardedAuthHeader(request)) {
    return unauthorizedResponse("Access token is required");
  }
  return null;
}

function buildAuthHeaders(request?: Request): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const authHeader = getForwardedAuthHeader(request);
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  return headers;
}

export async function backendFetch(path: string, request?: Request) {
  const incomingUrl = request ? new URL(request.url) : null;
  const query = incomingUrl?.search ?? "";
  const url = `${API_BASE_URL}${path}${query}`;

  const response = await fetch(url, {
    headers: buildAuthHeaders(request),
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPost(path: string, request: Request, options?: { requireAuth?: boolean }) {
  if (options?.requireAuth !== false) {
    const authError = requireAuthHeader(request);
    if (authError) return authError;
  }

  const url = `${API_BASE_URL}${path}`;
  const body = await request.text();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(request),
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

/** POST without requiring Authorization — for login, refresh-token, etc. */
export async function backendPostPublic(path: string, request: Request) {
  return backendPost(path, request, { requireAuth: false });
}

export async function backendPostMultipart(path: string, request: Request) {
  const authError = requireAuthHeader(request);
  if (authError) return authError;

  const url = `${API_BASE_URL}${path}`;
  const formData = await request.formData();

  const response = await fetch(url, {
    method: "POST",
    headers: buildAuthHeaders(request),
    body: formData,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPutMultipart(path: string, request: Request) {
  const authError = requireAuthHeader(request);
  if (authError) return authError;

  const url = `${API_BASE_URL}${path}`;
  const formData = await request.formData();

  const response = await fetch(url, {
    method: "PUT",
    headers: buildAuthHeaders(request),
    body: formData,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPut(path: string, request: Request) {
  const authError = requireAuthHeader(request);
  if (authError) return authError;

  const url = `${API_BASE_URL}${path}`;
  const body = await request.text();

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...buildAuthHeaders(request),
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPatch(path: string, request: Request) {
  const authError = requireAuthHeader(request);
  if (authError) return authError;

  const url = `${API_BASE_URL}${path}`;
  const body = await request.text();

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      ...buildAuthHeaders(request),
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendDelete(path: string, request: Request) {
  const authError = requireAuthHeader(request);
  if (authError) return authError;

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: buildAuthHeaders(request),
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
