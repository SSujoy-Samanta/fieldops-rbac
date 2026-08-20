import { prisma } from "@/lib/prisma";
import { type Prisma, AUTH_METHOD, SYSTEM_ROLE } from "@/generated/prisma/client";
import type { UserQueryInput } from "./users.schemas";

export const usersRepository = {
  /**
   * Retrieves paginated users with optional search, role filter, and status filter
   */
  async findUsers(query: UserQueryInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const { page, limit, search, role, isActive, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role: { name: role } } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      client.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roleId: true,
          isActive: true,
          isVerified: true,
          lastLoginAt: true,
          lastAuthMethod: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      }),
      client.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Finds a single user by primary key ID using PostgreSQL unique index, then checks deletedAt
   */
  async findUserById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const user = await client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        lastAuthMethod: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    module: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt !== null) {
      return null;
    }

    const { deletedAt: _, ...result } = user;
    return result;
  },

  /**
   * Finds user by unique email index, then checks deletedAt
   */
  async findUserByEmail(email: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const user = await client.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt !== null) {
      return null;
    }

    return user;
  },

  /**
   * Creates a new user record
   */
  async createUser(
    data: {
      email: string;
      name: string;
      passwordHash: string;
      roleId: string;
      avatar?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        avatar: data.avatar ?? null,
        isVerified: true, // Admin-created employees are verified
        emailVerifiedAt: new Date(),
        lastAuthMethod: AUTH_METHOD.EMAIL_PASSWORD,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  },

  /**
   * Updates user profile info
   */
  async updateUser(
    id: string,
    data: { name?: string; email?: string; avatar?: string | null },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  },

  /**
   * Updates user role
   */
  async updateUserRole(
    id: string,
    roleId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.update({
      where: { id },
      data: { roleId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  },

  /**
   * Activates or deactivates user
   */
  async updateUserStatus(
    id: string,
    isActive: boolean,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  },

  /**
   * Counts active users with role OWNER to prevent orphan lockouts
   */
  async countActiveOwners(tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.user.count({
      where: {
        isActive: true,
        deletedAt: null,
        role: { name: SYSTEM_ROLE.OWNER },
      },
    });
  },
};

export default usersRepository;
