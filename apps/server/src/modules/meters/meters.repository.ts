import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { UpdateMeterStatusDto } from './meters.validator';

export class MetersRepository {
  async findMeters(where: Prisma.MeterWhereInput, skip: number, take: number) {
    return prisma.meter.findMany({
      where,
      skip,
      take,
      include: {
        consumer: { select: { id: true, accountNumber: true, user: { select: { firstName: true, lastName: true } } } },
        transformer: { select: { id: true, name: true, serialNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countMeters(where: Prisma.MeterWhereInput) {
    return prisma.meter.count({ where });
  }

  async findMeterById(id: string) {
    return prisma.meter.findUnique({
      where: { id },
      include: { consumer: true }
    });
  }

  async findMeterReadings(meterId: string, dateLimit: Date) {
    return prisma.meterReading.findMany({
      where: {
        meterId,
        timestamp: { gte: dateLimit }
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  async updateMeterStatus(id: string, data: UpdateMeterStatusDto) {
    return prisma.meter.update({
      where: { id },
      data: { status: data.status },
    });
  }

  async logAudit(userId: string, action: string, resource: string, resourceId?: string, details?: any) {
    return prisma.auditLog.create({
      data: { userId, action, resource, resourceId, details },
    });
  }

  async createMeter(data: Prisma.MeterCreateInput) {
    return prisma.meter.create({ data });
  }

  async updateMeterConsumer(id: string, consumerId: string) {
    return prisma.meter.update({
      where: { id },
      data: { consumerId }
    });
  }
}

export const metersRepository = new MetersRepository();
