export function formatBearerToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("Bearer ") ? trimmed : `Bearer ${trimmed}`;
}

export function buildAuthorizationHeader(
  token: string | null | undefined
): Record<string, string> {
  const bearer = formatBearerToken(token);
  return bearer ? { Authorization: bearer } : {};
}
