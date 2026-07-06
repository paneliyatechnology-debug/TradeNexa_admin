/** Uses authenticated apiClientGet with API_BASE_URL when implementing. */
export const buyersService = {
  async getAll() {
    // return apiClientGet("/api/buyers");
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // return apiClientGet(`/api/buyers/${id}`);
    void id;
    throw new Error("Not implemented");
  },
};
