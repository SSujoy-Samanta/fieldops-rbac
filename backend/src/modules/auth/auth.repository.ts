import { prisma } from "@/lib/prisma";
import { type Prisma, AUTH_METHOD } from "@/generated/prisma/client";

export const authRepository = {
  /**
   * Finds user by unique email using PostgreSQL unique index
   */
  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.user.findUnique({
      where: { email },
    });
  },

  /**
   * Finds user by unique Google OAuth ID using PostgreSQL unique index
   */
  async findByGoogleId(googleId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.user.findUnique({
      where: { googleId },
    });
  },

  /**
   * Finds active user by unique id with clean AuthUser fields
   */
  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const user = await client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        lastAuthMethod: true,
        createdAt: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt !== null) return null;
    const { isActive: _, deletedAt: __, ...result } = user;
    return result;
  },

  /**
   * Updates last login metadata
   */
  async updateLastLogin(
    id: string,
    data: { ipAddress?: string | null; authMethod: AUTH_METHOD },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: data.ipAddress ?? null,
        lastAuthMethod: data.authMethod,
      },
    });
  },

  /**
   * Links Google Account to existing user
   */
  async linkGoogleAccount(
    id: string,
    data: { googleId: string; avatar?: string | null; ipAddress?: string | null },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.user.update({
      where: { id },
      data: {
        googleId: data.googleId,
        ...(data.avatar && { avatar: data.avatar }),
        isVerified: true,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
        lastLoginIp: data.ipAddress ?? null,
        lastAuthMethod: AUTH_METHOD.GOOGLE_OAUTH,
      },
    });
  },

  /**
   * Password reset operations
   */
  async createPasswordResetToken(
    data: { token: string; userId: string; expiresAt: Date },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.passwordResetToken.create({ data });
  },

  async findPasswordResetToken(tokenHash: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });
  },

  async completePasswordReset(
    tokenId: string,
    userId: string,
    passwordHash: string,
    tx?: Prisma.TransactionClient
  ) {
    const execute = async (client: Prisma.TransactionClient) => {
      await client.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await client.passwordResetToken.update({
        where: { id: tokenId },
        data: { isUsed: true },
      });
    };

    if (tx) return execute(tx);
    return prisma.$transaction(async (innerTx) => execute(innerTx));
  },
};
