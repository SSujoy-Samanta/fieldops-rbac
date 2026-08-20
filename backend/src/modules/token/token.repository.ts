import { prisma } from "@/lib/prisma";

export const tokenRepository = {
  async createRefreshToken(data: {
    token: string; // SHA-256 hash
    userId: string;
    expiresAt: Date;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const refreshToken = await tx.refreshToken.create({
        data: {
          token: data.token,
          userId: data.userId,
          expiresAt: data.expiresAt,
          deviceInfo: data.deviceInfo ?? null,
          ipAddress: data.ipAddress ?? null,
        },
      });

      await tx.authSession.create({
        data: {
          token: data.token,
          userId: data.userId,
          deviceInfo: data.deviceInfo ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          expiresAt: data.expiresAt,
        },
      });

      return refreshToken;
    });
  },

  async findByToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            deletedAt: true,
            roleId: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  async revokeToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { token: tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });
  },

  async revokeAllUserTokens(userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });

      await tx.authSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    });
  },

  async rotateToken(data: {
    oldToken: string; // old SHA-256 hash
    newToken: string; // new SHA-256 hash
    userId: string;
    expiresAt: Date;
    deviceInfo?: string | null;
    ipAddress?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      // Revoke old token
      await tx.refreshToken.updateMany({
        where: { token: data.oldToken, isRevoked: false },
        data: { isRevoked: true },
      });

      // Create new token
      return tx.refreshToken.create({
        data: {
          token: data.newToken,
          userId: data.userId,
          expiresAt: data.expiresAt,
          deviceInfo: data.deviceInfo ?? null,
          ipAddress: data.ipAddress ?? null,
        },
      });
    });
  },
};
