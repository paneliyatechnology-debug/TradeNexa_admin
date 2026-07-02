function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

export function isJwtExpired(token: string, bufferMs = 0): boolean {
  const expiryMs = getJwtExpiryMs(token);
  if (!expiryMs) return false;
  return Date.now() >= expiryMs - bufferMs;
}

export function getJwtTimeToExpiryMs(token: string): number | null {
  const expiryMs = getJwtExpiryMs(token);
  if (!expiryMs) return null;
  return expiryMs - Date.now();
}
