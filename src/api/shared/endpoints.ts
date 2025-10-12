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
  },
  contents: {
    list: version("/playable-contents/contents"),
    upload: (id: string) => version(`/playable-contents/${id}/transcode`),
    status: (id: string) => version(`/playable-contents/${id}/status`),
  },
  channels: {
    detail: (id: string) => version(`/channels/${id}`),
    contents: (id: string) => version(`/channels/${id}/contents`),
  },
  /// ... other endpoints
};
