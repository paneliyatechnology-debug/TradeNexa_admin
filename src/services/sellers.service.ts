/** Uses authenticated apiClientGet with API_BASE_URL when implementing. */
export const sellersService = {
  async getAll() {
    // return apiClientGet("/api/sellers");
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // return apiClientGet(`/api/sellers/${id}`);
    void id;
    throw new Error("Not implemented");
  },
};
