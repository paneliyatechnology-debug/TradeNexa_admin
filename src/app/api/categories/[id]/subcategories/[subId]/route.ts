import { backendDelete, backendFetch, backendPut, backendPutMultipart } from "@/lib/backend-fetch";

interface RouteParams {
  params: Promise<{ id: string; subId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id, subId } = await params;
  return backendFetch(`/categories/${id}/subcategories/${subId}`, request);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id, subId } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return backendPutMultipart(`/categories/${id}/subcategories/${subId}`, request);
  }

  return backendPut(`/categories/${id}/subcategories/${subId}`, request);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id, subId } = await params;
  return backendDelete(`/categories/${id}/subcategories/${subId}`, request);
}
