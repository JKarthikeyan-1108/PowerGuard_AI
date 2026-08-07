import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { alertsService } from './alerts.service';

export class AlertsController {
  async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await alertsService.getAlerts(req.query as Record<string, string>, req.user!);
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  async createAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alert = await alertsService.createAlert(req.body);
      res.status(201).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  async updateAlertStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alert = await alertsService.updateAlertStatus(req.params.id as string, req.body, req.user!);
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }
}

export const alertsController = new AlertsController();
