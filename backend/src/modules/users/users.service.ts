import bcrypt from "bcrypt";
import createError from "http-errors";
import { usersRepository } from "./users.repository";
import { rolesRepository } from "@/modules/roles/roles.repository";
import { CacheService } from "@/services/cache.service";
import { keys } from "@/config/keys";
import { CACHE_TTL } from "@/config/constants";
import { hashFilters } from "@/utils/hash-filters";
import { generateRandomPassword } from "@/utils/crypto";
import { SYSTEM_ROLE } from "@/types/rbac";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryInput,
} from "./users.schemas";
import type { AuditActor } from "@/utils/actor";

export const usersService = {
  /**
   * Retrieves paginated users list using Cache-Aside with deterministic filter hashing
   */
  async getUsers(query: UserQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.users.list(filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return usersRepository.findUsers(query);
      },
      CACHE_TTL.USER_LIST
    );
  },

  /**
   * Retrieves a single user profile & role permissions by ID
   */
  async getUserById(id: string, actor?: AuditActor) {
    const user = await CacheService.getOrSet(
      keys.users.byId(id),
      async () => {
        const found = await usersRepository.findUserById(id);
        if (!found) {
          throw createError(404, "User not found");
        }

        const permissions = found.role.rolePermissions.map((rp) => rp.permission);
        const permissionKeys = permissions.map((p) => p.key);

        return {
          id: found.id,
          email: found.email,
          name: found.name,
          avatar: found.avatar,
          roleId: found.roleId,
          role: {
            id: found.role.id,
            name: found.role.name,
            description: found.role.description,
          },
          permissions,
          permissionKeys,
          isActive: found.isActive,
          isVerified: found.isVerified,
          emailVerifiedAt: found.emailVerifiedAt,
          lastLoginAt: found.lastLoginAt,
          lastAuthMethod: found.lastAuthMethod,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
        };
      },
      CACHE_TTL.USER_DATA
    );

    // NIST Hierarchical Inspection Defense:
    // Non-owners can only inspect their own profile or subordinate Field Employees
    if (
      actor &&
      actor.role !== SYSTEM_ROLE.OWNER &&
      actor.userId !== id &&
      user.role.name !== SYSTEM_ROLE.FIELD_EMPLOYEE
    ) {
      throw createError(
        403,
        "Privilege violation: Managers can only inspect subordinate Field Employees"
      );
    }

    return user;
  },

  /**
   * Creates a new user with auto-generated secure password
   * and multi-layer cache invalidation.
   */
  async createUser(input: CreateUserInput, actor?: AuditActor) {
    // 1. Check for email uniqueness
    const existing = await usersRepository.findUserByEmail(input.email);
    if (existing) {
      throw createError(409, "A user with this email already exists");
    }

    // 2. Resolve role from DB by unique enum name
    const role = await rolesRepository.findRoleByName(input.role);
    if (!role) {
      throw createError(404, `Role '${input.role}' not found in database`);
    }

    // 3. Privilege Escalation Defense: Only an OWNER can create another OWNER or MANAGER
    if (role.name !== SYSTEM_ROLE.FIELD_EMPLOYEE && actor?.role !== SYSTEM_ROLE.OWNER) {
      throw createError(
        403,
        "Privilege escalation prevented: Only an Owner can create Manager or Owner accounts"
      );
    }

    // 4. Always auto-generate a secure random high-entropy password
    const plainPassword = generateRandomPassword(12);

    // 5. Secure password hashing
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 6. Create in database
    const created = await usersRepository.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
      roleId: role.id,
      avatar: input.avatar,
    });

    // 7. Unified Matrix Invalidation: Bust user lists, roles list (user counts changed), and tag in roleUsers
    await CacheService.invalidateUser(created.id, {
      allLists: true,
      roleList: true,
      newRoleId: created.roleId,
    });

    return {
      ...created,
      temporaryPassword: plainPassword,
    };
  },

  /**
   * Updates user name, email, or avatar
   */
  async updateUser(id: string, input: UpdateUserInput) {
    const user = await usersRepository.findUserById(id);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (input.email && input.email !== user.email) {
      const existing = await usersRepository.findUserByEmail(input.email);
      if (existing) {
        throw createError(409, "A user with this email already exists");
      }
    }

    const updated = await usersRepository.updateUser(id, input);

    // Invalidate user detail & list caches
    await CacheService.invalidateUser(id, {
      userDetail: true,
      allLists: true,
    });

    return updated;
  },

  /**
   * Updates a user's role using the SYSTEM_ROLE enum ('FIELD_EMPLOYEE', 'MANAGER', 'OWNER')
   */
  async updateUserRole(
    id: string,
    input: UpdateUserRoleInput,
    actor?: AuditActor
  ) {
    const user = await usersRepository.findUserById(id);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.role.name === input.role) {
      return user; // No change needed
    }

    const targetRole = await rolesRepository.findRoleByName(input.role);
    if (!targetRole) {
      throw createError(404, `Role '${input.role}' not found in database`);
    }

    // 1. Sole Owner Lockout Defense: Prevent demoting the last active Owner
    if (
      user.role.name === SYSTEM_ROLE.OWNER &&
      targetRole.name !== SYSTEM_ROLE.OWNER
    ) {
      const activeOwners = await usersRepository.countActiveOwners();
      if (activeOwners <= 1) {
        throw createError(
          400,
          "Cannot change role: System requires at least one active Owner account"
        );
      }
    }

    // 2. Privilege Escalation Defense:
    // - Non-owners cannot promote someone to MANAGER or OWNER
    // - Non-owners cannot modify an existing MANAGER or OWNER's role
    if (
      (targetRole.name !== SYSTEM_ROLE.FIELD_EMPLOYEE || user.role.name !== SYSTEM_ROLE.FIELD_EMPLOYEE) &&
      actor?.role !== SYSTEM_ROLE.OWNER
    ) {
      throw createError(
        403,
        "Privilege escalation prevented: Managers can only manage Field Employee roles"
      );
    }

    const oldRoleId = user.roleId;
    const updated = await usersRepository.updateUserRole(id, targetRole.id);

    // 3. Full Cascade Invalidation:
    // Evicts user detail, paginated lists, RBAC caches, adjusts role tagging, and updates roles list count
    await CacheService.invalidateUser(id, {
      userDetail: true,
      allLists: true,
      rbac: true,
      oldRoleId,
      newRoleId: targetRole.id,
      roleList: true,
    });

    return updated;
  },

  /**
   * Activates or deactivates a user with session revocation on deactivation
   */
  async updateUserStatus(
    id: string,
    input: UpdateUserStatusInput,
    actor?: AuditActor
  ) {
    const user = await usersRepository.findUserById(id);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Deactivation safety rules
    if (!input.isActive) {
      // 1. Self-deactivation prevention
      if (actor?.userId === id) {
        throw createError(400, "Cannot deactivate your own account");
      }

      // 2. Sole owner lockout defense
      if (user.role.name === SYSTEM_ROLE.OWNER) {
        const activeOwners = await usersRepository.countActiveOwners();
        if (activeOwners <= 1) {
          throw createError(
            400,
            "Cannot deactivate the last remaining active Owner account"
          );
        }
      }

      // 3. Hierarchical status defense: Non-owners can only deactivate Field Employees
      if (user.role.name !== SYSTEM_ROLE.FIELD_EMPLOYEE && actor?.role !== SYSTEM_ROLE.OWNER) {
        throw createError(
          403,
          "Privilege violation: Managers can only deactivate Field Employees"
        );
      }
    }

    const updated = await usersRepository.updateUserStatus(id, input.isActive);

    // Invalidate user detail, lists, RBAC, and if deactivated: immediately revoke active sessions
    await CacheService.invalidateUser(id, {
      userDetail: true,
      allLists: true,
      rbac: true,
      authSessions: !input.isActive,
      roleList: true,
    });

    return updated;
  },
};

export default usersService;
