import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import type { ApiResponse } from "@/types/api";
import type {
  BackendLoginData,
  BackendProfile,
  BackendRefreshTokenData,
} from "@/types/backend-auth";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";
import { buildAuthorizationHeader } from "@/utils/auth-header";
import { mapBackendRole } from "@/utils/map-backend-role";

const LOGIN_URL = `${API_BASE_URL}${API_ENDPOINTS.auth.login}`;
const REFRESH_URL = `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`;
const LOGOUT_URL = `${API_BASE_URL}${API_ENDPOINTS.auth.logout}`;
const PROFILE_URL = `${API_BASE_URL}${API_ENDPOINTS.auth.profile}`;

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

async function publicApiPost<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new AuthServiceError("Unable to reach the server. Please try again.");
  }

  let json: ApiResponse<T>;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new AuthServiceError("Unable to reach the server. Please try again.");
  }

  if (!response.ok || !json.success) {
    throw new AuthServiceError(
      json.message || "Invalid email or password. Please try again.",
      response.status
    );
  }

  return json;
}

async function authenticatedApiGet<T>(url: string, token: string): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...buildAuthorizationHeader(token),
      },
      cache: "no-store",
    });
  } catch {
    throw new AuthServiceError("Unable to verify your account. Please try again.");
  }

  let json: ApiResponse<T>;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new AuthServiceError("Unable to verify your account. Please try again.", response.status);
  }

  if (!response.ok || !json.success) {
    throw new AuthServiceError(
      json.message || "Unable to verify your account. Please try again.",
      response.status
    );
  }

  return json;
}

function mapProfileToUser(profile: BackendProfile): User {
  return {
    id: profile.uuid,
    email: profile.email,
    name: profile.full_name,
    role: mapBackendRole(profile.role),
    avatar: profile.profile_image ?? undefined,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const json = await publicApiPost<BackendLoginData>(LOGIN_URL, {
      email: credentials.email,
      password: credentials.password,
    });

    const { access_token, refresh_token } = json.data;
    const profile = await this.getProfile(access_token);

    return {
      user: mapProfileToUser(profile),
      token: access_token,
      refreshToken: refresh_token,
    };
  },

  async getProfile(token: string): Promise<BackendProfile> {
    const json = await authenticatedApiGet<BackendProfile>(PROFILE_URL, token);
    return json.data;
  },

  /** Validate stored session and return updated user from profile. */
  async validateSession(token: string): Promise<User> {
    const profile = await this.getProfile(token);
    return mapProfileToUser(profile);
  },

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const json = await publicApiPost<BackendRefreshTokenData>(REFRESH_URL, {
      refresh_token: refreshToken,
    });

    return {
      token: json.data.access_token,
      refreshToken: json.data.refresh_token,
    };
  },

  async logout(token: string, refreshToken: string): Promise<void> {
    try {
      await fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthorizationHeader(token),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Clear local session even if logout API fails.
    }
  },
};
