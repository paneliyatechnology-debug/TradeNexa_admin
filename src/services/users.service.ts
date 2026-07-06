/** Uses authenticated apiClientGet with API_BASE_URL when implementing. */
export const usersService = {
  async getAll() {
    // return apiClientGet("/api/users");
    throw new Error("Not implemented");
  },

  async getById(id: string) {
    // return apiClientGet(`/api/users/${id}`);
    void id;
    throw new Error("Not implemented");
  },
};
