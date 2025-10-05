export const QUERY_KEY = {
  USER: {
    ALL: () => ["users"],
    LIST: () => [...QUERY_KEY.USER.ALL(), "list"],
    DETAIL: (id?: string) => [...QUERY_KEY.USER.ALL(), "detail", id],
  },
  AUTH: {
    PERMISSIONS: () => ["permissions"],
  },
};
