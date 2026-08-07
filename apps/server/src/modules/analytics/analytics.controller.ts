import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { analyticsService } from './analytics.service';

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
}

export const analyticsController = new AnalyticsController();
