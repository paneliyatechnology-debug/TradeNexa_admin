import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

export const buyersService = {
  async getAll() {
    // GET `${API_BASE_URL}${API_ENDPOINTS.buyers.list}`
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // GET `${API_BASE_URL}${API_ENDPOINTS.buyers.detail(id)}`
    void id;
    throw new Error("Not implemented");
  },
};

export { API_BASE_URL, API_ENDPOINTS };
