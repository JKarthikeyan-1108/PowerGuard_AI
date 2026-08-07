import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { consumersService } from './consumers.service';

export class ConsumersController {
  async getConsumers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await consumersService.getConsumers(req.query as Record<string, string>);
      res.json({ success: true, data: result.consumers, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getConsumerById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consumer = await consumersService.getConsumerById(req.params.id as string, req.user!);
      res.json({ success: true, data: consumer });
    } catch (error) {
      next(error);
    }
  }
}

export const consumersController = new ConsumersController();
