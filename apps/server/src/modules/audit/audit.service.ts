import prisma from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class AuditService {
  async log(userId: string | null, action: string, resource: string, resourceId?: string, details?: any, reqInfo?: { ip?: string, userAgent?: string }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details: details ? (details as Prisma.InputJsonValue) : undefined,
          ipAddress: reqInfo?.ip,
          userAgent: reqInfo?.userAgent
        }
      });
    } catch (error) {
      logger.error(`Failed to create audit log: ${error}`);
    }
  }

  async getLogs(filters: { userId?: string; action?: string; resource?: string; startDate?: string; endDate?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });
  }
}

export const auditService = new AuditService();
