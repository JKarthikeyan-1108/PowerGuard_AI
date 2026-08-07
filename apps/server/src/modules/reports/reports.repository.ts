import prisma from '../../config/database';

export class ReportsRepository {
  async getRecentAlerts() {
    return prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { meter: true }
    });
  }

  async getRecentConsumers() {
    return prisma.consumerProfile.findMany({
      take: 500,
      include: { user: { select: { firstName: true, lastName: true } } }
    });
  }

  async getTheftAnalytics() {
    return prisma.theftPrediction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { meter: true }
    });
  }

  async getEnergyAnalytics() {
    return prisma.meterReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000,
      include: { meter: true }
    });
  }

  async getRevenueAnalytics() {
    return prisma.billPrediction.findMany({
      orderBy: { month: 'desc' },
      take: 500,
      include: { consumer: { include: { user: { select: { firstName: true, lastName: true } } } } }
    });
  }

  async getLossAnalytics() {
    return prisma.transformer.findMany({
      take: 100,
      select: {
        id: true,
        name: true,
        serialNumber: true,
        currentLoad: true,
        capacity: true
      }
    });
  }

  async getCO2Analytics() {
    return prisma.recommendation.findMany({
      where: { estimatedSavings: { not: null } },
      take: 500,
      include: { consumer: { include: { user: { select: { firstName: true, lastName: true } } } } }
    });
  }
}

export const reportsRepository = new ReportsRepository();
