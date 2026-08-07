import prisma from '../../config/database';
import logger from '../../config/logger';

export class BillingService {
  /**
   * Generates a monthly bill for a specific consumer.
   */
  public async generateBill(consumerId: string, month: number, year: number): Promise<any> {
    try {
      const consumer = await prisma.consumerProfile.findUnique({
        where: { id: consumerId },
        include: { tariffPlan: true, meters: true },
      });

      if (!consumer) throw new Error('Consumer not found');

      // Setup billing period (first day to last day of the month)
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1); // 1st of next month

      // Fetch all readings for the consumer's meters in this month
      const meterIds = consumer.meters.map((m) => m.id);
      const readings = await prisma.meterReading.findMany({
        where: {
          meterId: { in: meterIds },
          timestamp: { gte: startDate, lt: endDate },
        },
      });

      const tariff = consumer.tariffPlan;
      if (!tariff) {
        // Fallback to simple flat rate billing if no tariff plan is attached
        const totalUsageKwh = readings.reduce((sum, r) => sum + r.value, 0); // Simplified assuming value is consumption delta
        const totalAmount = totalUsageKwh * consumer.tariffRate;

        return await prisma.bill.create({
          data: {
            consumerId,
            billingPeriod: startDate,
            totalUsageKwh,
            peakUsageKwh: 0,
            offPeakUsageKwh: totalUsageKwh,
            baseCost: totalAmount,
            peakCost: 0,
            offPeakCost: totalAmount,
            totalAmount,
            dueDate: new Date(year, month, 15), // Due on 15th of next month
            status: 'PENDING',
          },
        });
      }

      // ── Dynamic Tariff Calculation ──
      let peakUsageKwh = 0;
      let offPeakUsageKwh = 0;

      // Check if current month is a peak seasonal month
      const isPeakSeason = tariff.peakMonths.split(',').includes(String(month));
      const seasonalMultiplier = isPeakSeason ? tariff.seasonalMultiplier : 1.0;

      readings.forEach((reading) => {
        const hour = reading.timestamp.getHours();
        const usage = reading.value; // Simplified: assuming each reading contains delta consumption

        if (hour >= tariff.peakStartHour && hour < tariff.peakEndHour) {
          peakUsageKwh += usage;
        } else {
          offPeakUsageKwh += usage;
        }
      });

      const totalUsageKwh = peakUsageKwh + offPeakUsageKwh;

      const peakCost = peakUsageKwh * tariff.peakRate * seasonalMultiplier;
      const offPeakCost = offPeakUsageKwh * tariff.offPeakRate * seasonalMultiplier;
      const baseCost = totalUsageKwh * tariff.baseRate * seasonalMultiplier; // Not used if Peak/OffPeak apply, but stored for reference

      const totalAmount = peakCost + offPeakCost;

      // Check if bill already exists
      const existingBill = await prisma.bill.findFirst({
        where: { consumerId, billingPeriod: startDate },
      });

      if (existingBill) {
        return await prisma.bill.update({
          where: { id: existingBill.id },
          data: {
            totalUsageKwh,
            peakUsageKwh,
            offPeakUsageKwh,
            baseCost,
            peakCost,
            offPeakCost,
            totalAmount,
          },
        });
      }

      return await prisma.bill.create({
        data: {
          consumerId,
          billingPeriod: startDate,
          totalUsageKwh,
          peakUsageKwh,
          offPeakUsageKwh,
          baseCost,
          peakCost,
          offPeakCost,
          totalAmount,
          dueDate: new Date(year, month, 15),
          status: 'PENDING',
        },
      });
    } catch (error: any) {
      logger.error(`[BillingService] Error generating bill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates bills for ALL consumers for a specific month
   */
  public async generateAllBills(month: number, year: number): Promise<{ generated: number }> {
    const consumers = await prisma.consumerProfile.findMany({ select: { id: true } });
    let generated = 0;
    
    for (const consumer of consumers) {
      try {
        await this.generateBill(consumer.id, month, year);
        generated++;
      } catch (err) {
        // Skip errors for individual consumers to allow batch to continue
      }
    }
    
    return { generated };
  }

  /**
   * Retrieves all bills for a consumer with savings analysis
   */
  public async getConsumerBills(consumerId: string): Promise<any> {
    const bills = await prisma.bill.findMany({
      where: { consumerId },
      orderBy: { billingPeriod: 'desc' },
      include: {
        consumer: {
          include: { tariffPlan: true }
        }
      }
    });
    
    // Attach savings calculation
    return bills.map(bill => {
      const tariff = bill.consumer.tariffPlan;
      if (!tariff) return { ...bill, savings: 0 };
      
      // Calculate what it would have cost if all usage was during peak hours
      const worstCaseCost = bill.totalUsageKwh * tariff.peakRate;
      const savings = Math.max(0, worstCaseCost - bill.totalAmount);
      
      return { ...bill, savings };
    });
  }

  public async getTariffPlans(): Promise<any> {
    return prisma.tariffPlan.findMany();
  }
}

export const billingService = new BillingService();
