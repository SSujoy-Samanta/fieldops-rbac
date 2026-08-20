// Redis Key Schemas
// Structured namespaces with non-blocking pattern matchers for single-node Redis

export const keys = {
  auth: {
    session: (userId: string) => `auth:session:${userId}`,
    refreshToken: (userId: string, hash: string) => `auth:refresh:${userId}:${hash}`,
    blacklist: (jti: string) => `auth:blacklist:${jti}`,
    userTokens: (userId: string) => `auth:user_tokens:${userId}`,
    locked: (userId: string) => `auth:locked:${userId}`,
    failures: (userId: string) => `auth:failures:${userId}`,
    magic: (hash: string) => `auth:magic:${hash}`,
    reset: (hash: string) => `auth:reset:${hash}`,
    oauthState: (state: string) => `auth:oauth:state:${state}`,
    userPattern: (userId: string) => `auth:*:${userId}*`,
  },
  roles: {
    list: () => "roles:list",
    byId: (roleId: string) => `roles:detail:${roleId}`,
    permissions: () => "permissions:list",
    listPattern: () => "roles:*",
  },
  rbac: {
    perms: (userId: string) => `rbac:perms:${userId}`,
    permissions: (userId: string) => `rbac:perms:${userId}`,
    roleMeta: (userId: string) => `rbac:role_meta:${userId}`,
    roleUsers: (roleId: string) => `rbac:role_users:${roleId}`,
    userPattern: (userId: string) => `rbac:*:${userId}*`,
  },
  users: {
    byId: (userId: string) => `users:detail:${userId}`,
    list: (filterHash: string) => `users:list:${filterHash}`,
    listPattern: () => "users:list:*",
    count: () => "users:count",
    userPattern: (userId: string) => `users:*:${userId}*`,
  },
  attendance: {
    selfList: (userId: string, filterHash: string) => `attendance:self:${userId}:${filterHash}`,
    selfListPattern: (userId: string) => `attendance:self:${userId}:*`,
    teamList: (filterHash: string) => `attendance:team:${filterHash}`,
    teamListPattern: () => "attendance:team:*",
    todayStatus: (userId: string, dateStr: string) => `attendance:status:${userId}:${dateStr}`,
    todayStatusPattern: (userId: string) => `attendance:status:${userId}:*`,
    stats: (filterHash: string) => `attendance:stats:${filterHash}`,
    statsPattern: () => "attendance:stats:*",
  },
  visits: {
    byId: (visitId: string) => `visits:detail:${visitId}`,
    selfList: (userId: string, filterHash: string) => `visits:self:${userId}:${filterHash}`,
    selfListPattern: (userId: string) => `visits:self:${userId}:*`,
    teamList: (filterHash: string) => `visits:team:${filterHash}`,
    teamListPattern: () => "visits:team:*",
    stats: (filterHash: string) => `visits:stats:${filterHash}`,
    statsPattern: () => "visits:stats:*",
  },
  rateLimit: {
    email: (action: string, email: string) => `ratelimit:email:${action}:${email}`,
    ip: (ip: string) => `ratelimit:ip:${ip}`,
  },
};

export const authKeys = keys.auth;
export const rbacKeys = keys.rbac;
export const userKeys = keys.users;
export const attendanceKeys = keys.attendance;
export const visitKeys = keys.visits;
