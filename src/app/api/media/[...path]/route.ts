import { BACKEND_URL } from "@/config/api";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { path } = await params;
  const targetPath = path ? (Array.isArray(path) ? path.join("/") : String(path)) : "";
  const url = `${BACKEND_URL}/media/${targetPath}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      // Fallback: also try fetching from /uploads/
      const fallbackUrl = `${BACKEND_URL}/uploads/${targetPath}`;
      const fallbackRes = await fetch(fallbackUrl, { cache: "no-store" });
      if (fallbackRes.ok) {
        const contentType = fallbackRes.headers.get("content-type") ?? "application/octet-stream";
        const body = await fallbackRes.arrayBuffer();
        return new Response(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      console.error(`[MediaProxy] Failed to fetch ${url} - status: ${response.status}`);
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
  } catch (err) {
    console.error(`[MediaProxy] Fetch error for ${url}:`, err);
    return new Response("Media fetch error", { status: 500 });
  }
}
