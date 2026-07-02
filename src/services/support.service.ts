/** Uses authenticated apiClientGet — add `/api/support/tickets` proxy route when implementing. */
export const supportService = {
  async getTickets() {
    // return apiClientGet("/api/support/tickets");
    throw new Error("Not implemented");
  },

  async getTicket(id: string) {
    // return apiClientGet(`/api/support/tickets/${id}`);
    void id;
    throw new Error("Not implemented");
  },
};
