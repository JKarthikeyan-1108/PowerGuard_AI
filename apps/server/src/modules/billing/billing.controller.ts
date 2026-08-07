import { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';
import logger from '../../config/logger';
import prisma from '../../config/database'; // For seeding default tariffs if missing

export class BillingController {
  
  public generateBills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { month, year } = req.body;
      const data = await billingService.generateAllBills(month, year);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getConsumerBills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { consumerId } = req.params;
      const data = await billingService.getConsumerBills(consumerId);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTariffPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let data = await billingService.getTariffPlans();
      
      // If none exist, create some defaults for demo purposes
      if (data.length === 0) {
        await prisma.tariffPlan.createMany({
          data: [
            {
              name: 'Standard Residential Time-of-Use',
              type: 'RESIDENTIAL',
              baseRate: 0.12,
              peakRate: 0.25,
              offPeakRate: 0.08,
              peakStartHour: 17,
              peakEndHour: 21,
              seasonalMultiplier: 1.2,
              peakMonths: '6,7,8',
            },
            {
              name: 'Industrial Heavy Duty',
              type: 'INDUSTRIAL',
              baseRate: 0.10,
              peakRate: 0.30,
              offPeakRate: 0.06,
              peakStartHour: 14,
              peakEndHour: 20,
              seasonalMultiplier: 1.5,
              peakMonths: '6,7,8',
            }
          ]
        });
        
        // Also assign a tariff plan to all consumers for demo purposes
        const plans = await prisma.tariffPlan.findMany();
        if (plans.length > 0) {
          await prisma.consumerProfile.updateMany({
            data: { tariffPlanId: plans[0].id }
          });
        }
        
        data = await billingService.getTariffPlans();
      }
      
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const billingController = new BillingController();
