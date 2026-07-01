import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

export const supportService = {
  async getTickets() {
    // GET `${API_BASE_URL}${API_ENDPOINTS.support.tickets}`
    throw new Error("Not implemented");
  },

  async getTicket(id: string) {
    // GET `${API_BASE_URL}${API_ENDPOINTS.support.ticket(id)}`
    void id;
    throw new Error("Not implemented");
  },
};

export { API_BASE_URL, API_ENDPOINTS };
