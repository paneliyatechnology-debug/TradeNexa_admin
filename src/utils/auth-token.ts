import { STORAGE_KEYS } from "@/constants/storage-keys";

interface StoredAuth {
  token: string;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed.token ?? null;
  } catch {
    return null;
  }
}
