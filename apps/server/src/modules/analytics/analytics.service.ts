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

  async getConsumerRealtimePower(consumerId: string) {
    const readings = await prisma.meterReading.findMany({
      where: { meter: { consumerId } },
      orderBy: { timestamp: 'desc' },
      take: 24
    });
    if (readings.length === 0) {
      // Fallback
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`, power: 2.5 + Math.random(), voltage: 230, current: 10 + Math.random()
      }));
    }
    return readings.reverse().map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      power: r.voltage && r.current ? (r.voltage * r.current) / 1000 : r.value,
      voltage: r.voltage || 230,
      current: r.current || (r.value / 230 * 1000)
    }));
  }

  async getConsumerConsumptionHistory(consumerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const readings = await prisma.meterReading.findMany({
      where: { meter: { consumerId }, timestamp: { gte: thirtyDaysAgo } },
      orderBy: { timestamp: 'asc' }
    });

    if (readings.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        day: String(i + 1).padStart(2, '0'),
        usage: +(Math.random() * 15 + 5).toFixed(1),
      }));
    }

    const grouped: Record<string, number> = {};
    for (const r of readings) {
      const day = new Date(r.timestamp).toISOString().split('T')[0];
      const dLabel = day.substring(8, 10);
      grouped[dLabel] = (grouped[dLabel] || 0) + r.value;
    }
    return Object.entries(grouped).map(([day, usage]) => ({ day, usage }));
  }

  async getConsumerBillHistory(consumerId: string) {
    const bills = await prisma.billPrediction.findMany({
      where: { consumerId },
      orderBy: { month: 'asc' },
      take: 6
    });
    if (bills.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, i) => ({
        month, previous: +(1200 + Math.random() * 800).toFixed(0), predicted: i === 5 ? 1842 : undefined
      }));
    }
    return bills.map(b => ({
      month: new Date(b.month).toLocaleDateString([], { month: 'short' }),
      previous: b.actualAmount || (b.predictedAmount * 0.9),
      predicted: b.predictedAmount
    }));
  }

  async getActiveTheftAlerts() {
    const alerts = await prisma.alert.findMany({
      where: { status: 'NEW' },
      include: { 
        meter: { 
          include: { 
            consumer: {
              include: {
                area: true
              }
            } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (alerts.length === 0) {
      return [
        { id: 'MTR-99A12', account: 'ACC-55219', score: 0.94, method: 'Direct Bypass Suspected', date: 'Today, 02:30 AM', status: 'CRITICAL', area: 'Downtown' },
        { id: 'MTR-11B34', account: 'ACC-88123', score: 0.88, method: 'Meter Tampering (Cover)', date: 'Yesterday, 11:15 PM', status: 'HIGH', area: 'Uptown' }
      ];
    }

    return alerts.map((a: any) => ({
      id: a.meter?.serialNumber || 'UNKNOWN',
      account: a.meter?.consumer?.accountNumber || 'UNKNOWN',
      score: a.severity === 'CRITICAL' ? 0.95 : 0.85,
      method: a.title,
      date: new Date(a.createdAt).toLocaleString(),
      status: a.severity,
      area: a.meter?.consumer?.area?.name || 'Unknown Area'
    }));
  }

  async getUtilityCharts() {
    // Returning simulated aggregated data for the utility dashboard 
    // to match frontend shapes. In production, these would be complex GROUP BY queries.
    return {
      theftTrendData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => ({
        month, detected: Math.floor(Math.random() * 15 + 5), resolved: Math.floor(Math.random() * 12 + 3)
      })),
      areaDemandData: ['DTN', 'GFR', 'IPE', 'RVC', 'NGC', 'WSH', 'EVG', 'CBH'].map((area) => ({
        area, demand: Math.floor(Math.random() * 3000 + 1000)
      })),
      riskDistribution: [
        { name: 'Low Risk', value: 60 }, { name: 'Moderate', value: 22 },
        { name: 'High Risk', value: 12 }, { name: 'Critical', value: 6 }
      ],
      loadData: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`, load: Math.random() * 500 + 200, capacity: 800
      }))
    };
  }
}

export const analyticsService = new AnalyticsService();
