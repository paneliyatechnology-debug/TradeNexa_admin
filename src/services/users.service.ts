import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

/**
 * Users Service — placeholder for backend integration.
 * Replace mock implementations with actual API calls when backend is ready.
 */
export const usersService = {
  async getAll() {
    // GET `${API_BASE_URL}${API_ENDPOINTS.users.list}`
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // GET `${API_BASE_URL}${API_ENDPOINTS.users.detail(id)}`
    void id;
    throw new Error("Not implemented");
  },
};

export { API_BASE_URL, API_ENDPOINTS };
