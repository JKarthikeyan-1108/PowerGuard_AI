import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export class ConsumersRepository {
  async findConsumers(where: Prisma.ConsumerProfileWhereInput, skip: number, take: number) {
    return prisma.consumerProfile.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, avatar: true }
        },
        meters: {
          select: { id: true, serialNumber: true, status: true, type: true }
        },
        area: {
          select: { id: true, name: true, riskLevel: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countConsumers(where: Prisma.ConsumerProfileWhereInput) {
    return prisma.consumerProfile.count({ where });
  }

  async findConsumerById(id: string) {
    return prisma.consumerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true } },
        meters: true,
        area: true,
      },
    });
  }

  async updateConsumer(id: string, data: Prisma.ConsumerProfileUpdateInput) {
    return prisma.consumerProfile.update({
      where: { id },
      data,
    });
  }

  async deleteConsumer(id: string) {
    return prisma.consumerProfile.delete({
      where: { id },
    });
  }

  async getConsumerDashboard(id: string) {
    return prisma.consumerProfile.findUnique({
      where: { id },
      include: {
        meters: {
          include: {
            readings: {
              take: 10,
              orderBy: { timestamp: 'desc' }
            }
          }
        },
        billPredictions: {
          take: 6,
          orderBy: { month: 'desc' }
        },
        recommendations: {
          where: { applied: false },
          take: 5
        }
      }
    });
  }
}

export const consumersRepository = new ConsumersRepository();
