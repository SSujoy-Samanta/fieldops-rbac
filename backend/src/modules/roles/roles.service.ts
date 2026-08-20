import createError from "http-errors";
import { rolesRepository } from "./roles.repository";
import { rbacCache } from "@/lib/rbac-cache";
import { CacheService } from "@/services/cache.service";
import { keys } from "@/config/keys";
import { CACHE_TTL } from "@/config/constants";
import { type PERMISSION_MODULE } from "@/types/rbac";
import {
  IMMUTABLE_ROLES,
  ROLE_MINIMUM_PERMISSIONS,
  validatePermissionUpdate,
} from "./roles.policy";
import type { UpdateRolePermissionsInput } from "./roles.schemas";

export const rolesService = {
  /**
   * Retrieves all system permissions, structured as a flat list and grouped by module.
   * Cached for 24h — static system definitions never change at runtime.
   */
  async getAllPermissions() {
    return CacheService.getOrSet(
      keys.roles.permissions(),
      async () => {
        const permissions = await rolesRepository.findAllPermissions();

        const grouped = permissions.reduce(
          (acc, perm) => {
            const mod = perm.module;
            if (!acc[mod]) {
              acc[mod] = [];
            }
            acc[mod].push(perm);
            return acc;
          },
          {} as Record<PERMISSION_MODULE, typeof permissions>
        );

        return { permissions, grouped };
      },
      CACHE_TTL.PERMISSIONS_DATA
    );
  },

  /**
   * Retrieves all roles with their assigned permissions and active user count.
   * Cached for 1h with event-driven invalidation on updates.
   */
  async getAllRoles() {
    return CacheService.getOrSet(
      keys.roles.list(),
      async () => {
        const roles = await rolesRepository.findAllRoles();

        return roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          userCount: role._count.users,
          permissions: role.rolePermissions.map((rp) => rp.permission),
          permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
          isImmutable: IMMUTABLE_ROLES.has(role.name),
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }));
      },
      CACHE_TTL.ROLE_LIST
    );
  },

  /**
   * Retrieves a specific role by ID with Cache-Aside pattern.
   */
  async getRoleById(roleId: string) {
    return CacheService.getOrSet(
      keys.roles.byId(roleId),
      async () => {
        const role = await rolesRepository.findRoleById(roleId);
        if (!role) {
          throw createError(404, "Role not found");
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          userCount: role._count.users,
          permissions: role.rolePermissions.map((rp) => rp.permission),
          permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
          isImmutable: IMMUTABLE_ROLES.has(role.name),
          minimumPermissions: [...(ROLE_MINIMUM_PERMISSIONS.get(role.name) ?? [])],
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        };
      },
      CACHE_TTL.ROLE_DATA
    );
  },

  /**
   * Updates dynamic permissions for a role with full security validation.
   *
   * Business Rules Enforced (via roles.policy.ts):
   * 1. OWNER role is immutable — always rejected (403).
   * 2. Role minimum floor permissions cannot be stripped (400 with diff).
   * 3. Role maximum ceiling permissions cannot be exceeded (403 with diff).
   * 4. All provided permissionKeys must resolve to real DB records (mismatch check).
   * 5. On success: atomically invalidates role detail, roles list, and all user RBAC caches.
   */
  async updateRolePermissions(roleId: string, input: UpdateRolePermissionsInput) {
    // ── 1. Fetch role from DB (bypass cache for write operations — always fresh) ──
    const role = await rolesRepository.findRoleById(roleId);
    if (!role) {
      throw createError(404, "Role not found");
    }

    const incomingSet = new Set(input.permissionKeys);

    // ── 2. Policy engine: immutability + floor + ceiling checks ──
    validatePermissionUpdate(role.name, incomingSet);

    // ── 3. Integrity check: verify all submitted keys exist in the DB ──
    //    The repository silently drops unknown keys; we must catch the mismatch.
    const allPermissions = await rolesRepository.findAllPermissions();
    const knownKeys = new Set(allPermissions.map((p) => p.key));
    const unknownKeys = input.permissionKeys.filter((k) => !knownKeys.has(k));
    if (unknownKeys.length > 0) {
      throw createError(400, `Unknown permission keys submitted: [${unknownKeys.join(", ")}]`);
    }

    // ── 4. Update DB in atomic transaction ──
    const updated = await rolesRepository.updateRolePermissions(
      roleId,
      input.permissionKeys,
      input.description
    );

    if (!updated) {
      throw createError(500, "Failed to update role permissions");
    }

    // ── 5. Multi-layer cache invalidation ──
    //    Invalidates: roles:detail:{id}, roles:list, rbac:perms:{userId} for all role users
    await CacheService.invalidateRole(roleId);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      userCount: updated._count.users,
      permissions: updated.rolePermissions.map((rp) => rp.permission),
      permissionKeys: updated.rolePermissions.map((rp) => rp.permission.key),
      isImmutable: IMMUTABLE_ROLES.has(updated.name),
      minimumPermissions: [...(ROLE_MINIMUM_PERMISSIONS.get(updated.name) ?? [])],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },

  /**
   * Returns the current user's cached RBAC context (role & permissions) for frontend authorization
   */
  async getMyPermissions(userId: string) {
    const rbacContext = await rbacCache.getUserRbacContext(userId);

    if (!rbacContext) {
      throw createError(401, "User not found or inactive");
    }

    return {
      rbac: rbacContext,
    };
  },
};

export default rolesService;
