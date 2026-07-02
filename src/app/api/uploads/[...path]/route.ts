import { BACKEND_URL } from "@/config/api";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { path } = await params;
  const url = `${BACKEND_URL}/uploads/${path.join("/")}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return new Response("Media not found", { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const body = await response.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
