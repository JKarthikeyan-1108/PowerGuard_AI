import { analyticsRepository } from './analytics.repository';
import { AnalyticsDashboardResponse, TheftHeatmapData } from './analytics.types';

import { aiService } from '../../services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getDashboardOverview(user: any): Promise<AnalyticsDashboardResponse | any> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      totalMeters,
      totalConsumers,
      activeAlerts,
      recentTheftPredictions,
      consumptionAgg
    ] = await Promise.all([
      analyticsRepository.countMeters(),
      analyticsRepository.countConsumers(),
      analyticsRepository.countActiveAlerts(),
      analyticsRepository.countRecentHighRiskThefts(thirtyDaysAgo),
      analyticsRepository.sumRecentConsumption(thirtyDaysAgo)
    ]);

    let predictedBill = 0;
    let avgDailyUsage = 0;
    let activeAlertsUser = activeAlerts;

    if (user?.role === 'CONSUMER') {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: user.id } });
      if (consumer) {
        activeAlertsUser = await prisma.alert.count({ where: { meter: { consumerId: consumer.id }, status: 'NEW' } });
        
        // AI ENGINE: Bill Prediction
        const billPrediction = await aiService.predictBill(consumer.id, [300, 310, 290], consumer.tariffRate, 26.5);
        if (billPrediction) {
          predictedBill = billPrediction.next_month_bill;
          
          await prisma.billPrediction.create({
            data: {
              consumerId: consumer.id,
              month: now,
              predictedAmount: predictedBill,
              predictedUsage: predictedBill / consumer.tariffRate, // estimated usage
              modelVersion: 'v1.0',
              confidence: 0.9
            }
          });
        }
        
        // AI ENGINE: Consumer Clustering & Recommendations
        const cluster = await aiService.getConsumerCluster(consumer.id, 12.5, 0.4, 0.2);
        if (cluster) {
          avgDailyUsage = 12.5; // From mock historical analysis
          // We could store recommendations here
        }
      }
      
      return {
        totalMeters,
        totalConsumers,
        activeAlerts: activeAlertsUser,
        highRiskTheftsLast30Days: recentTheftPredictions,
        totalConsumptionLast30Days: consumptionAgg._sum.value || 0,
        predictedBill,
        avgDailyUsage
      };
    }

    // AI ENGINE: Demand Forecast (For Utility/Admin)
    if (user?.role === 'UTILITY_OFFICER' || user?.role === 'ADMIN') {
      const forecast = await aiService.forecastDemand('system-wide', [1000, 1100, 1050, 1200, 1300, 1250, 1150, 1200, 1210, 1190, 1250, 1300, 1280, 1200, 1100, 1150, 1250, 1350, 1400, 1300, 1250, 1200, 1100, 1150, 1250, 1350, 1400, 1300, 1250, 1200]);
      if (forecast) {
        // Save forecast
        await prisma.energyForecast.create({
          data: {
            forecastDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next day
            period: 'DAILY',
            predictedDemand: forecast.tomorrow,
            modelVersion: 'v1.0',
            confidence: 0.95
          }
        });
      }
    }

    return {
      totalMeters,
      totalConsumers,
      activeAlerts,
      highRiskTheftsLast30Days: recentTheftPredictions,
      totalConsumptionLast30Days: consumptionAgg._sum.value || 0,
    };
  }

  async getTheftHeatmap(): Promise<TheftHeatmapData[]> {
    const highRiskMeters = await analyticsRepository.getHighRiskMeters();

    return highRiskMeters.map((meter: any) => ({
      id: meter.id,
      lat: meter.latitude,
      lng: meter.longitude,
      riskLevel: meter.theftPredictions[0]?.riskLevel,
      probability: meter.theftPredictions[0]?.probability
    }));
  }

  async getForecast() {
    return analyticsRepository.getForecasts();
  }
}

export const analyticsService = new AnalyticsService();
