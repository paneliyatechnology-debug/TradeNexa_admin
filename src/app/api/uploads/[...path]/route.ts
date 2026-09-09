import { BACKEND_URL, URL_CONFIG } from "@/config/api";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { path } = await params;
  const rawPath = path ? (Array.isArray(path) ? path.join("/") : String(path)) : "";
  const cleanPath = rawPath.replace(/^(uploads|media)\//, "");
  const search = new URL(request.url).search;

  const candidateUrls = [
    `${BACKEND_URL}/uploads/${cleanPath}${search}`,
    `${BACKEND_URL}/media/${cleanPath}${search}`,
    `${URL_CONFIG.live.origin}/uploads/${cleanPath}${search}`,
    `${URL_CONFIG.live.origin}/media/${cleanPath}${search}`,
  ];

  for (const targetUrl of candidateUrls) {
    try {
      const response = await fetch(targetUrl, { cache: "no-store" });
      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "application/octet-stream";
        const body = await response.arrayBuffer();
        return new Response(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch {
      /* try next candidate */
    }
  }

  return new Response("Media not found", { status: 404 });
}
