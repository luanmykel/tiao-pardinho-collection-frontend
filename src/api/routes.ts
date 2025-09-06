export const API_ROUTES = {
  songs: "/songs",
  suggestions: "/suggestions",
  admin: {
    users: "/admin/users",
    suggestions: "/admin/suggestions",
  },
  auth: {
    login: "/login",
    logout: "/logout",
    me: "/me",
    avatar: "/me/avatar",
    refresh: "/refresh",
  },
  health: "/health",
} as const;
