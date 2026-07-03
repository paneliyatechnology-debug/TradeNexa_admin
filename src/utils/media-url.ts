import { BACKEND_URL } from "@/config/api";

/** Public upload URL on Railway — stored in API data, used for links. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${path}`;
}

function toProxyPath(mediaUrl: string): string | null {
  try {
    const parsed = new URL(mediaUrl);

    if (parsed.pathname.startsWith("/media/")) {
      const mediaPath = parsed.pathname.replace(/^\/media\/?/, "");
      return `/api/media/${mediaPath}`;
    }

    if (parsed.pathname.startsWith("/uploads/")) {
      const uploadPath = parsed.pathname.replace(/^\/uploads\/?/, "");
      return `/api/uploads/${uploadPath}`;
    }

    return null;
  } catch {
    if (mediaUrl.startsWith("/media/")) {
      return `/api${mediaUrl}`;
    }

    if (mediaUrl.startsWith("/uploads/")) {
      return `/api${mediaUrl}`;
    }

    return null;
  }
}

/** Same-origin proxy URL for <img> previews (avoids Railway CORS/CORP from Vercel/localhost). */
export function resolveMediaPreviewUrl(url: string | null | undefined): string | null {
  const mediaUrl = resolveMediaUrl(url);
  if (!mediaUrl) return null;

  return toProxyPath(mediaUrl) ?? mediaUrl;
}

/** Prefer same-origin proxy for embedded images whenever available. */
export function resolveMediaDisplayUrl(url: string | null | undefined): string | null {
  const mediaUrl = resolveMediaUrl(url);
  if (!mediaUrl) return null;

  const proxyPath = toProxyPath(mediaUrl);
  if (proxyPath) {
    return proxyPath;
  }

  return mediaUrl;
}
