import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export class AnalyticsRepository {
  async countMeters() {
    return prisma.meter.count();
  }

  async countConsumers() {
    return prisma.consumerProfile.count();
  }

  async countActiveAlerts() {
    return prisma.alert.count({ where: { status: { in: ['NEW', 'INVESTIGATING'] } } });
  }

  async countRecentHighRiskThefts(since: Date) {
    return prisma.theftPrediction.count({
      where: {
        createdAt: { gte: since },
        riskLevel: { in: ['HIGH', 'CRITICAL'] }
      }
    });
  }

  async sumRecentConsumption(since: Date) {
    return prisma.meterReading.aggregate({
      where: { timestamp: { gte: since } },
      _sum: { value: true }
    });
  }

  async getHighRiskMeters() {
    return prisma.meter.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        theftPredictions: {
          some: { riskLevel: { in: ['HIGH', 'CRITICAL'] } }
        }
      },
      include: {
        theftPredictions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async getForecasts() {
    return prisma.energyForecast.findMany({
      orderBy: { forecastDate: 'asc' },
      take: 30
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
