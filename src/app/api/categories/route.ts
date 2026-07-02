import { backendFetch, backendPost, backendPostMultipart } from "@/lib/backend-fetch";

export async function GET(request: Request) {
  return backendFetch("/categories", request);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return backendPostMultipart("/categories", request);
  }

  return backendPost("/categories", request);
}
