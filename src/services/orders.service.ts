/** Uses authenticated apiClientGet — add `/api/orders` proxy route when implementing. */
export const ordersService = {
  async getAll() {
    // return apiClientGet("/api/orders");
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // return apiClientGet(`/api/orders/${id}`);
    void id;
    throw new Error("Not implemented");
  },
};
