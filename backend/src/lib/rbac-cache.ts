import { redis, rbacKeys, REDIS_TTL } from "@/lib/redis";
import { rbacRepository } from "@/modules/rbac/rbac.repository";
import { logger } from "@/lib/logger";
import { SYSTEM_ROLE, PERMISSION_KEY, type RbacContext, type CachedRoleMeta } from "@/types/rbac";

export const rbacCache = {
  /**
   * Retrieves user's RBAC context (role & permissions) using Cache-Aside pattern.
   * If cache misses, populates Redis with 5-minute TTL and tags roleUsers for fast invalidation.
   */
  async getUserRbacContext(userId: string): Promise<RbacContext | null> {
    try {
      // 1. Check Redis Cache
      const [roleMetaRaw, permissions] = await Promise.all([
        redis.get(rbacKeys.roleMeta(userId)),
        redis.smembers(rbacKeys.permissions(userId)),
      ]);

      if (roleMetaRaw) {
        const meta: CachedRoleMeta = JSON.parse(roleMetaRaw);
        if (meta?.roleId && meta?.roleName) {
          return {
            roleId: meta.roleId,
            roleName: meta.roleName,
            permissions: permissions as PERMISSION_KEY[],
          };
        }
      }
    } catch (err) {
      logger.error({ err, userId }, "Redis error during RBAC cache lookup, falling back to DB");
    }

    // 2. Cache Miss: Fetch from Postgres via Repository
    const dbData = await rbacRepository.getUserRoleAndPermissions(userId);
    if (!dbData) {
      return null;
    }

    const context: RbacContext = {
      roleId: dbData.roleId,
      roleName: dbData.roleName,
      permissions: dbData.permissions,
    };

    // 3. Populate Redis Cache asynchronously
    try {
      const roleMeta: CachedRoleMeta = {
        roleId: dbData.roleId,
        roleName: dbData.roleName,
      };

      const pipeline = redis.pipeline();
      pipeline.set(
        rbacKeys.roleMeta(userId),
        JSON.stringify(roleMeta),
        "EX",
        REDIS_TTL.RBAC_PERMISSIONS
      );
      pipeline.del(rbacKeys.permissions(userId));
      if (dbData.permissions.length > 0) {
        pipeline.sadd(rbacKeys.permissions(userId), ...dbData.permissions);
        pipeline.expire(rbacKeys.permissions(userId), REDIS_TTL.RBAC_PERMISSIONS);
      }
      // Tag user under role for event-driven invalidation
      pipeline.sadd(rbacKeys.roleUsers(dbData.roleId), userId);
      pipeline.expire(rbacKeys.roleUsers(dbData.roleId), REDIS_TTL.RBAC_PERMISSIONS * 2);

      await pipeline.exec();
    } catch (err) {
      logger.error({ err, userId }, "Failed to write RBAC context to Redis cache");
    }

    return context;
  },

  /**
   * Fast O(1) permission check with Owner bypass
   */
  async hasPermission(
    userId: string,
    permission: PERMISSION_KEY
  ): Promise<{ granted: boolean; context: RbacContext | null }> {
    const context = await this.getUserRbacContext(userId);
    if (!context) {
      return { granted: false, context: null };
    }

    // Owner role always has full bypass authority
    if (context.roleName === SYSTEM_ROLE.OWNER) {
      return { granted: true, context };
    }

    const granted = context.permissions.includes(permission);
    return { granted, context };
  },

  /**
   * Checks if user has at least one of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissions: PERMISSION_KEY[]
  ): Promise<{ granted: boolean; context: RbacContext | null }> {
    const context = await this.getUserRbacContext(userId);
    if (!context) {
      return { granted: false, context: null };
    }

    if (context.roleName === SYSTEM_ROLE.OWNER) {
      return { granted: true, context };
    }

    const granted = permissions.some((p) => context.permissions.includes(p));
    return { granted, context };
  },

  /**
   * Checks if user has all specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: PERMISSION_KEY[]
  ): Promise<{ granted: boolean; context: RbacContext | null }> {
    const context = await this.getUserRbacContext(userId);
    if (!context) {
      return { granted: false, context: null };
    }

    if (context.roleName === SYSTEM_ROLE.OWNER) {
      return { granted: true, context };
    }

    const granted = permissions.every((p) => context.permissions.includes(p));
    return { granted, context };
  },

  /**
   * Checks if user has one of the specified roles
   */
  async hasRole(
    userId: string,
    roles: SYSTEM_ROLE[]
  ): Promise<{ granted: boolean; context: RbacContext | null }> {
    const context = await this.getUserRbacContext(userId);
    if (!context) {
      return { granted: false, context: null };
    }

    const granted = roles.includes(context.roleName);
    return { granted, context };
  },

  /**
   * Invalidates cached permissions & role metadata for a single user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      pipeline.del(rbacKeys.permissions(userId));
      pipeline.del(rbacKeys.roleMeta(userId));
      await pipeline.exec();
      logger.info({ userId }, "RBAC permission cache invalidated for user");
    } catch (err) {
      logger.error({ err, userId }, "Error invalidating user RBAC cache");
    }
  },

  /**
   * Tag-Based Bulk Invalidation:
   * When a role's permissions are updated, evicts all users associated with that role in a single atomic round-trip.
   */
  async invalidateRoleCache(roleId: string): Promise<void> {
    try {
      const userIds = await redis.smembers(rbacKeys.roleUsers(roleId));

      const pipeline = redis.pipeline();
      if (userIds.length > 0) {
        for (const uid of userIds) {
          pipeline.del(rbacKeys.permissions(uid));
          pipeline.del(rbacKeys.roleMeta(uid));
        }
      }
      pipeline.del(rbacKeys.roleUsers(roleId));

      await pipeline.exec();
      logger.info({ roleId, affectedUsers: userIds.length }, "RBAC permission cache invalidated for entire role");
    } catch (err) {
      logger.error({ err, roleId }, "Error invalidating role RBAC cache");
    }
  },
};

export default rbacCache;
