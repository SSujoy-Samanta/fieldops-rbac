import { redis } from "@/lib/redis";
import { keys } from "@/config/keys";
import { rbacCache } from "@/lib/rbac-cache";
import { logger } from "@/lib/logger";

export interface RoleInvalidationOptions {
  roleId?: string;
  allLists?: boolean;            // Bust roles:list
  roleDetail?: boolean;          // Bust roles:detail:{roleId}
  permissions?: boolean;         // Bust permissions:list
  affectedUsers?: boolean;       // Bust all users holding this role (rbac perms + roleMeta + user detail)
  allUserLists?: boolean;        // Bust all users:list:* caches because role permissions/meta embedded in user responses
  fullFlush?: boolean;           // Bust everything related to roles and their users
}

export interface UserInvalidationOptions {
  userId?: string;
  oldRoleId?: string;            // Old role to untag from rbac:role_users:{oldRoleId}
  newRoleId?: string;            // New role to tag in rbac:role_users:{newRoleId}
  userDetail?: boolean;          // Bust users:detail:{userId}
  allLists?: boolean;            // Bust users:list:* paginated caches
  rbac?: boolean;                // Bust rbac:perms:{userId} and rbac:role_meta:{userId}
  authSessions?: boolean;        // Bust auth:session:{userId} and user tokens (e.g. on deactivation / password change)
  roleList?: boolean;            // Bust roles:list (because role member counts changed)
  fullFlush?: boolean;           // Bust all user details, lists, rbac, and sessions
}

export interface AttendanceInvalidationOptions {
  userId?: string;               // Bust attendance:self:{userId}:* and attendance:status:{userId}:*
  teamLists?: boolean;           // Bust attendance:team:* and attendance:stats:*
  fullFlush?: boolean;
}

export interface VisitInvalidationOptions {
  visitId?: string;              // Bust visits:detail:{visitId}
  userId?: string;               // Bust visits:self:{userId}:*
  teamLists?: boolean;           // Bust visits:team:* and visits:stats:*
  fullFlush?: boolean;
}

/**
 * PRODUCTION-GRADE UNIFIED CACHE SERVICE
 *
 * Provides standardized Cache-Aside, non-blocking SCAN key discovery,
 * and unified matrix invalidation with atomic pipelines.
 */
export class CacheService {
  /**
   * Standardized Cache-Aside helper.
   * Checks Redis first; on miss, invokes fetcher, caches serialized JSON with TTL, and returns data.
   */
  static async getOrSet<T>(
    key: string,
    fetch: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      logger.error({ err, key }, "Redis GET error in CacheService.getOrSet, falling back to fetcher");
    }

    const fresh = await fetch();

    if (fresh !== undefined && fresh !== null) {
      try {
        await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
      } catch (err) {
        logger.error({ err, key }, "Redis SET error in CacheService.getOrSet");
      }
    }

    return fresh;
  }

  /**
   * Directly stores a value in Redis with a TTL in seconds
   */
  static async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.error({ err, key }, "Failed to set Redis cache key");
    }
  }

  /**
   * Gets a value directly from Redis
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.error({ err, key }, "Failed to get Redis cache key");
      return null;
    }
  }

  /**
   * Deletes a single or multiple keys
   */
  static async del(...keysList: string[]): Promise<void> {
    if (keysList.length === 0) return;
    try {
      await redis.del(...keysList);
    } catch (err) {
      logger.error({ err, keysList }, "Failed to delete Redis keys");
    }
  }

  /**
   * Non-blocking key discovery using SCAN stream to prevent event-loop blocking
   */
  static async findKeysByPattern(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const matchingKeys: string[] = [];
      const stream = redis.scanStream({ match: pattern, count: 100 });

      stream.on("data", (batch: string[]) => {
        matchingKeys.push(...batch);
      });

      stream.on("end", () => {
        resolve(matchingKeys);
      });

      stream.on("error", (err) => {
        logger.error({ err, pattern }, "Redis SCAN stream error during key discovery");
        reject(err);
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // UNIFIED ROLE & PERMISSION INVALIDATION MATRIX
  // ─────────────────────────────────────────────────────────────────

  /**
   * Comprehensive Role Invalidation Matrix:
   * Cascades through:
   * 1. Role detail by ID (`roles:detail:{id}`)
   * 2. All roles list (`roles:list`)
   * 3. Permissions list (`permissions:list`)
   * 4. Tagged active users of this role (`rbac:perms:{uid}`, `rbac:role_meta:{uid}`, `users:detail:{uid}`)
   * 5. Paginated user list caches (`users:list:*`)
   */
  static async invalidateRole(
    roleId: string,
    options: RoleInvalidationOptions = {}
  ): Promise<void> {
    const {
      allLists = true,
      roleDetail = true,
      permissions = false,
      affectedUsers = true,
      allUserLists = true,
      fullFlush = false,
    } = options;

    const pipeline = redis.pipeline();

    try {
      // 1. Role detail cache
      if (roleDetail || fullFlush) {
        pipeline.del(keys.roles.byId(roleId));
      }

      // 2. Roles list cache
      if (allLists || fullFlush) {
        pipeline.del(keys.roles.list());
      }

      // 3. Permissions list cache
      if (permissions || fullFlush) {
        pipeline.del(keys.roles.permissions());
      }

      // 4. Tag-based invalidation for all active users of this role
      if (affectedUsers || fullFlush) {
        const userIds = await redis.smembers(keys.rbac.roleUsers(roleId));
        if (userIds.length > 0) {
          for (const uid of userIds) {
            pipeline.del(keys.rbac.perms(uid));
            pipeline.del(keys.rbac.roleMeta(uid));
            pipeline.del(keys.users.byId(uid));
          }
        }
        pipeline.del(keys.rbac.roleUsers(roleId));
      }

      // 5. Bust user lists because role permissions/meta are embedded in user list responses
      if (allUserLists || fullFlush) {
        const userListKeys = await this.findKeysByPattern(keys.users.listPattern());
        userListKeys.forEach((k) => pipeline.del(k));
      }

      await pipeline.exec();
      logger.info({ roleId, options }, "Role cache and dependent caches invalidated");
    } catch (err) {
      logger.error({ err, roleId }, "Error during unified role cache invalidation");
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UNIFIED USER INVALIDATION MATRIX
  // ─────────────────────────────────────────────────────────────────

  /**
   * Comprehensive User Invalidation Matrix:
   * Cascades through:
   * 1. User detail by ID (`users:detail:{userId}`)
   * 2. Paginated user list caches (`users:list:*`)
   * 3. RBAC permission & role metadata caches (`rbac:perms:{userId}`, `rbac:role_meta:{userId}`)
   * 4. Role membership tagging (`rbac:role_users:{oldRoleId}` / `{newRoleId}`)
   * 5. Roles list cache (`roles:list` to update userCount)
   * 6. Active sessions and auth tokens (on deactivation / security event)
   */
  static async invalidateUser(
    userId: string,
    options: UserInvalidationOptions = {}
  ): Promise<void> {
    const {
      oldRoleId,
      newRoleId,
      userDetail = true,
      allLists = true,
      rbac = true,
      authSessions = false,
      roleList = false,
      fullFlush = false,
    } = options;

    const pipeline = redis.pipeline();

    try {
      // 1. User detail cache
      if (userDetail || fullFlush) {
        pipeline.del(keys.users.byId(userId));
      }

      // 2. User list caches (SCAN stream discovery)
      if (allLists || fullFlush) {
        const listKeys = await this.findKeysByPattern(keys.users.listPattern());
        listKeys.forEach((k) => pipeline.del(k));
      }

      // 3. User RBAC context caches
      if (rbac || fullFlush) {
        pipeline.del(keys.rbac.perms(userId));
        pipeline.del(keys.rbac.roleMeta(userId));
      }

      // 4. Role membership tagging updates
      if (oldRoleId) {
        pipeline.srem(keys.rbac.roleUsers(oldRoleId), userId);
      }
      if (newRoleId) {
        pipeline.sadd(keys.rbac.roleUsers(newRoleId), userId);
      }

      // 5. Roles list (user counts changed)
      if (roleList || oldRoleId || newRoleId || fullFlush) {
        pipeline.del(keys.roles.list());
      }

      // 6. Security Invalidation: Active sessions and tokens
      if (authSessions || fullFlush) {
        pipeline.del(keys.auth.session(userId));
        pipeline.del(keys.auth.userTokens(userId));
        const authKeysFound = await this.findKeysByPattern(keys.auth.userPattern(userId));
        authKeysFound.forEach((k) => pipeline.del(k));
      }

      await pipeline.exec();
      logger.info({ userId, options }, "User cache and dependent caches invalidated");
    } catch (err) {
      logger.error({ err, userId }, "Error during unified user cache invalidation");
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UNIFIED ATTENDANCE INVALIDATION MATRIX
  // ─────────────────────────────────────────────────────────────────

  static async invalidateAttendance(
    options: AttendanceInvalidationOptions = {}
  ): Promise<void> {
    const { userId, teamLists = true, fullFlush = false } = options;
    const pipeline = redis.pipeline();

    try {
      // 1. User's self attendance lists & today's status
      if (userId) {
        const selfListKeys = await this.findKeysByPattern(keys.attendance.selfListPattern(userId));
        selfListKeys.forEach((k) => pipeline.del(k));

        const statusKeys = await this.findKeysByPattern(keys.attendance.todayStatusPattern(userId));
        statusKeys.forEach((k) => pipeline.del(k));
      }

      // 2. Team attendance lists & aggregate stats
      if (teamLists || fullFlush) {
        const teamKeys = await this.findKeysByPattern(keys.attendance.teamListPattern());
        teamKeys.forEach((k) => pipeline.del(k));

        const statsKeys = await this.findKeysByPattern(keys.attendance.statsPattern());
        statsKeys.forEach((k) => pipeline.del(k));
      }

      await pipeline.exec();
      logger.info({ options }, "Attendance caches invalidated");
    } catch (err) {
      logger.error({ err }, "Error during attendance cache invalidation");
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UNIFIED VISIT INVALIDATION MATRIX
  // ─────────────────────────────────────────────────────────────────

  static async invalidateVisit(
    options: VisitInvalidationOptions = {}
  ): Promise<void> {
    const { visitId, userId, teamLists = true, fullFlush = false } = options;
    const pipeline = redis.pipeline();

    try {
      // 1. Single visit detail
      if (visitId) {
        pipeline.del(keys.visits.byId(visitId));
      }

      // 2. User's self visit lists
      if (userId) {
        const selfKeys = await this.findKeysByPattern(keys.visits.selfListPattern(userId));
        selfKeys.forEach((k) => pipeline.del(k));
      }

      // 3. Team visit lists & aggregate stats
      if (teamLists || fullFlush) {
        const teamKeys = await this.findKeysByPattern(keys.visits.teamListPattern());
        teamKeys.forEach((k) => pipeline.del(k));

        const statsKeys = await this.findKeysByPattern(keys.visits.statsPattern());
        statsKeys.forEach((k) => pipeline.del(k));
      }

      await pipeline.exec();
      logger.info({ options }, "Visit caches invalidated");
    } catch (err) {
      logger.error({ err }, "Error during visit cache invalidation");
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // DIRECT CONVENIENCE HELPERS
  // ─────────────────────────────────────────────────────────────────

  static async invalidatePermissionsList(): Promise<void> {
    try {
      await redis.del(keys.roles.permissions());
      logger.info("Permissions list cache invalidated");
    } catch (err) {
      logger.error({ err }, "Error invalidating permissions list cache");
    }
  }

  static async invalidateUserRbac(userId: string): Promise<void> {
    await rbacCache.invalidateUserCache(userId);
  }
}

export default CacheService;
