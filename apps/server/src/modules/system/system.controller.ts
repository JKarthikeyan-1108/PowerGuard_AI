import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { systemService } from './system.service';

export class SystemController {
  async getHealth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const health = await systemService.getHealthMetrics();
      res.json({ success: true, data: health });
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await systemService.getLogs(req.query as Record<string, string>);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.getGlobalSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
