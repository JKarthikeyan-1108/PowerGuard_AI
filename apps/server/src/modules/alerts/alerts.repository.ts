import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { UpdateAlertStatusDto } from './alerts.types';

export class AlertsRepository {
  async findAlerts(where: Prisma.AlertWhereInput) {
    return prisma.alert.findMany({
      where,
      include: {
        meter: { select: { id: true, serialNumber: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createAlert(data: any) {
    return prisma.alert.create({
      data,
      include: {
        meter: { select: { id: true, serialNumber: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      }
    });
  }

  async updateAlertStatus(id: string, data: any) {
    return prisma.alert.update({
      where: { id },
      data,
    });
  }

  async logAudit(userId: string, action: string, resource: string, resourceId: string, details?: any) {
    return prisma.auditLog.create({
      data: { userId, action, resource, resourceId, details }
    });
  }
}

export const alertsRepository = new AlertsRepository();
