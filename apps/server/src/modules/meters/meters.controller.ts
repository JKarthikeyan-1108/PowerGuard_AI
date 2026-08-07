import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { metersService } from './meters.service';

export class MetersController {
  async getMeters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await metersService.getMeters(req.query as Record<string, string>);
      res.json({ success: true, data: result.meters, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getMeterReadings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const readings = await metersService.getMeterReadings(req.params.id as string, req.query as Record<string, string>, req.user!);
      res.json({ success: true, data: readings });
    } catch (error) {
      next(error);
    }
  }

  async updateMeterStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const meter = await metersService.updateMeterStatus(req.params.id as string, req.body, req.user!);
      res.json({ success: true, data: meter });
    } catch (error) {
      next(error);
    }
  }
}

export const metersController = new MetersController();
