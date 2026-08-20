import { prisma } from "@/lib/prisma";
import type { Prisma, PERMISSION_KEY } from "@/generated/prisma/client";

export const rolesRepository = {
  /**
   * Retrieves all predefined permissions from Postgres
   */
  async findAllPermissions(tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
      select: {
        id: true,
        key: true,
        name: true,
        module: true,
        description: true,
      },
    });
  },

  /**
   * Retrieves all roles with their assigned permissions and assigned user counts
   */
  async findAllRoles(tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.role.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                module: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  },

  /**
   * Finds a specific role by ID with permissions and user count
   */
  async findRoleById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                module: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  },

  /**
   * Finds a specific role by unique enum name
   */
  async findRoleByName(name: any, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },

  /**
   * Synchronizes dynamic permissions for a role in an atomic transaction
   */
  async updateRolePermissions(
    roleId: string,
    permissionKeys: PERMISSION_KEY[],
    description?: string,
    tx?: Prisma.TransactionClient
  ) {
    const execute = async (client: Prisma.TransactionClient) => {
      // 1. Resolve permission IDs for the provided keys
      const permissions = await client.permission.findMany({
        where: { key: { in: permissionKeys } },
        select: { id: true, key: true },
      });

      // 2. Update role description if provided
      if (description !== undefined) {
        await client.role.update({
          where: { id: roleId },
          data: { description },
        });
      }

      // 3. Remove all existing permission associations for this role
      await client.rolePermission.deleteMany({
        where: { roleId },
      });

      // 4. Insert new permission associations
      if (permissions.length > 0) {
        await client.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId,
            permissionId: p.id,
          })),
        });
      }

      // 5. Return updated role with fresh permissions
      return client.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  module: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: { users: true },
          },
        },
      });
    };

    if (tx) return execute(tx);
    return prisma.$transaction(async (innerTx) => execute(innerTx));
  },
};

export default rolesRepository;
