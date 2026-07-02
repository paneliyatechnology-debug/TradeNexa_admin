import { backendDelete, backendFetch, backendPut, backendPutMultipart } from "@/lib/backend-fetch";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return backendFetch(`/categories/${id}`, request);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return backendPutMultipart(`/categories/${id}`, request);
  }

  return backendPut(`/categories/${id}`, request);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return backendDelete(`/categories/${id}`, request);
}
