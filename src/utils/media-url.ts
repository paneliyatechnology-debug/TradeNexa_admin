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

/** Same-origin proxy URL for <img> previews (Railway CORP blocks direct embed from localhost). */
export function resolveMediaPreviewUrl(url: string | null | undefined): string | null {
  const mediaUrl = resolveMediaUrl(url);
  if (!mediaUrl) return null;

  try {
    const parsed = new URL(mediaUrl);
    if (!parsed.pathname.startsWith("/uploads/")) {
      return mediaUrl;
    }

    const uploadPath = parsed.pathname.replace(/^\/uploads\/?/, "");
    return `/api/uploads/${uploadPath}`;
  } catch {
    if (mediaUrl.startsWith("/uploads/")) {
      return `/api${mediaUrl}`;
    }
    return mediaUrl;
  }
}
