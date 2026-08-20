import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const rbacRepository = {
  /**
   * Fetches the user's role and associated permission keys from Postgres
   */
  async getUserRoleAndPermissions(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;

    const user = await client.user.findUnique({
      where: { id: userId },
      select: {
        isActive: true,
        deletedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive || user.deletedAt !== null) {
      return null;
    }

    return {
      roleId: user.role.id,
      roleName: user.role.name,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.key),
    };
  },
};

export default rbacRepository;
