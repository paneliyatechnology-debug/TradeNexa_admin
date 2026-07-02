/** Refresh access token this long before it expires (1 hour). */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 60 * 1000;

/** How often to check token expiry while the app is open (5 minutes). */
export const TOKEN_CHECK_INTERVAL_MS = 5 * 60 * 1000;

/** Fallback TTLs when JWT expiry cannot be decoded. */
export const ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
