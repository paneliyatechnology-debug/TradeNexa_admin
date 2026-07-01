import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

export const sellersService = {
  async getAll() {
    // GET `${API_BASE_URL}${API_ENDPOINTS.sellers.list}`
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // GET `${API_BASE_URL}${API_ENDPOINTS.sellers.detail(id)}`
    void id;
    throw new Error("Not implemented");
  },
};

export { API_BASE_URL, API_ENDPOINTS };
