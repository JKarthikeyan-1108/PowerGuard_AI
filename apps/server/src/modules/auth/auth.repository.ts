import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        consumerProfile: true,
        utilityOfficer: true,
        roles: true,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        consumerProfile: true,
        roles: true,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null 
      },
    });
  }

  async incrementFailedLogins(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    
    const attempts = user.failedLoginAttempts + 1;
    let lockoutUntil = user.lockoutUntil;

    // Lockout logic: 5 failures = 15m lockout
    if (attempts >= 5) {
      lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockoutUntil,
      },
    });
  }

  async findRefreshToken(tokenStr: string) {
    return prisma.refreshToken.findUnique({
      where: { token: tokenStr },
      include: { user: { include: { roles: true } } },
    });
  }

  async deleteRefreshTokenById(id: string) {
    return prisma.refreshToken.delete({ where: { id } });
  }

  async deleteRefreshTokensByToken(tokenStr: string) {
    return prisma.refreshToken.deleteMany({
      where: { token: tokenStr },
    });
  }

  async deleteRefreshTokensByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async createRefreshToken(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async findUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, roles: true, status: true, emailVerified: true,
        lastLoginAt: true, createdAt: true,
        consumerProfile: {
          include: {
            area: true,
            meters: { select: { id: true, serialNumber: true, status: true, type: true } },
          },
        },
        utilityOfficer: true,
      },
    });
  }

  async logAudit(userId: string, action: string, resource: string, details?: any) {
    return prisma.auditLog.create({
      data: { userId, action, resource, details: details ? (details as Prisma.InputJsonValue) : undefined },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, failedLoginAttempts: 0, lockoutUntil: null },
    });
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async markPasswordResetTokenUsed(tokenId: string) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  }
}

export const authRepository = new AuthRepository();
