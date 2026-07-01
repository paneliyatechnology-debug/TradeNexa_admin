import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { MOCK_USERS } from "@/constants/mock-users";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

/**
 * Auth Service — placeholder for backend integration.
 * Replace mock implementation with actual API calls when backend is ready.
 */
export const authService = {
  /**
   * POST {API_BASE_URL}{API_ENDPOINTS.auth.login}
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // if (!response.ok) throw new Error('Invalid credentials');
  // return response.json();

    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password. Please try again.");
    }

    const { password, ...userWithoutPassword } = user;
    void password;

    return {
      user: userWithoutPassword,
      token: `mock_token_${user.id}_${Date.now()}`,
    };
  },

  /**
   * POST {API_BASE_URL}{API_ENDPOINTS.auth.logout}
   */
  async logout(): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.logout}`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${token}` },
  // });

    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  /**
   * GET {API_BASE_URL}{API_ENDPOINTS.auth.me}
   */
  async getCurrentUser(): Promise<AuthResponse["user"]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.me}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return response.json();

    throw new Error("Not implemented — use stored session for mock auth");
  },
};

// Export for reference when integrating
export { API_BASE_URL, API_ENDPOINTS };
