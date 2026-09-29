import { BACKEND_URL } from "@/config/api";

/** Public upload URL on Railway — stored in API data, used for links and images. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    let clean = trimmed;
    if (clean.includes("tradenexabackend-production.up.railway.app")) {
      clean = clean.replace(
        "tradenexabackend-production.up.railway.app",
        "tradenexabackend-dev.up.railway.app"
      );
    }
    return clean;
  }

  const cleanPath = trimmed.replace(/^\/+/, "");

  if (cleanPath.startsWith("media/") || cleanPath.startsWith("uploads/")) {
    return `${BACKEND_URL}/${cleanPath}`;
  }

  return `${BACKEND_URL}/media/${cleanPath}`;
}

export function resolveMediaPreviewUrl(url: string | null | undefined): string | null {
  return resolveMediaUrl(url);
}

export function resolveMediaDisplayUrl(url: string | null | undefined): string | null {
  return resolveMediaUrl(url);
}
