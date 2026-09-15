import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { analyticsService } from './analytics.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsController {
  async getDashboardOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await analyticsService.getDashboardOverview(req.user);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getTheftHeatmap(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const heatmap = await analyticsService.getTheftHeatmap();
      res.json({ success: true, data: heatmap });
    } catch (error) {
      next(error);
    }
  }

  async getForecast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const forecast = await analyticsService.getForecast();
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }

  async getConsumerRealtimePower(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user!.id } });
      const data = await analyticsService.getConsumerRealtimePower(consumer?.id || 'mock');
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getConsumerConsumptionHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user!.id } });
      const data = await analyticsService.getConsumerConsumptionHistory(consumer?.id || 'mock');
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getConsumerBillHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user!.id } });
      const data = await analyticsService.getConsumerBillHistory(consumer?.id || 'mock');
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getActiveTheftAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getActiveTheftAlerts();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getUtilityCharts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getUtilityCharts();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

export const analyticsController = new AnalyticsController();
