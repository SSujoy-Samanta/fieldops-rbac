export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  rbac: {
    all: ["rbac"] as const,
    myPermissions: () => [...queryKeys.rbac.all, "my-permissions"] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    today: () => [...queryKeys.attendance.all, "today"] as const,
    myHistory: (filters?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, "my-history", filters] as const,
    teamList: (filters?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, "team-list", filters] as const,
    teamStats: (filters?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, "team-stats", filters] as const,
  },
  visits: {
    all: ["visits"] as const,
    myVisits: (filters?: Record<string, unknown>) =>
      [...queryKeys.visits.all, "self", filters] as const,
    teamVisits: (filters?: Record<string, unknown>) =>
      [...queryKeys.visits.all, "team", filters] as const,
    stats: (filters?: Record<string, unknown>) =>
      [...queryKeys.visits.all, "stats", filters] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: () => [...queryKeys.roles.all, "list"] as const,
    detail: (id: string) => [...queryKeys.roles.all, "detail", id] as const,
    permissions: () => [...queryKeys.roles.all, "permissions"] as const,
  },
};
