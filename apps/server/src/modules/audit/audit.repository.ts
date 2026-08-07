import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export class AuditRepository {
  async findAuditLogs(where: Prisma.AuditLogWhereInput, skip: number, take: number) {
    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      include: { user: { select: { email: true, firstName: true, lastName: true, roles: true } } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async countAuditLogs(where: Prisma.AuditLogWhereInput) {
    return prisma.auditLog.count({ where });
  }

  async findUniqueActions() {
    return prisma.auditLog.findMany({ distinct: ['action'], select: { action: true } });
  }
}

export const auditRepository = new AuditRepository();
