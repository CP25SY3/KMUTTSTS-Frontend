const version = (p: string) => `/api${p}`;

export const pathEndpoints = {
  auth: {
    login: version("/auth/local"),
  },
  users: {
    me: version("/users/me"),
  },
  player: {
    playable_content: version(""),
  }
  /// ... other endpoints
};
