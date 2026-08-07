import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export class SystemRepository {
  async findSystemLogs(where: Prisma.SystemLogWhereInput) {
    return prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100 // Last 100 logs
    });
  }

  async findGlobalSettings() {
    return prisma.setting.findMany({
      where: { scope: 'global' }
    });
  }
}

export const systemRepository = new SystemRepository();
