import { backendFetch, backendPost, backendPostMultipart } from "@/lib/backend-fetch";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return backendFetch(`/categories/${id}/subcategories`, request);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return backendPostMultipart(`/categories/${id}/subcategories`, request);
  }

  return backendPost(`/categories/${id}/subcategories`, request);
}
