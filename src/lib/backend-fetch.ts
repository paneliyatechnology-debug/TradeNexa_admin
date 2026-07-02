import { API_BASE_URL } from "@/config/api";

function getForwardedAuthHeader(request?: Request): string | null {
  if (!request) return null;
  return request.headers.get("Authorization");
}

export async function backendFetch(path: string, request?: Request) {
  const incomingUrl = request ? new URL(request.url) : null;
  const query = incomingUrl?.search ?? "";
  const url = `${API_BASE_URL}${path}${query}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const authHeader = getForwardedAuthHeader(request);
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPost(path: string, request: Request) {
  const url = `${API_BASE_URL}${path}`;
  const body = await request.text();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const authHeader = getForwardedAuthHeader(request);
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function backendPostMultipart(path: string, request: Request) {
  const url = `${API_BASE_URL}${path}`;
  const formData = await request.formData();

  const headers: Record<string, string> = { Accept: "application/json" };
  const authHeader = getForwardedAuthHeader(request);
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
