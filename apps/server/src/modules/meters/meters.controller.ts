import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { metersService } from './meters.service';
import { readingProcessor } from '../../services/realtime/ReadingProcessor';

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

  async ingestReading(req: any, res: Response, next: NextFunction) {
    try {
      const { serialNumber, value, voltage, current, powerFactor, frequency, timestamp } = req.body;
      if (!serialNumber || value === undefined) {
        res.status(400).json({ success: false, error: 'serialNumber and value are required' });
        return;
      }
      await readingProcessor.process({
        serialNumber,
        value: Number(value),
        voltage: voltage !== undefined ? Number(voltage) : undefined,
        current: current !== undefined ? Number(current) : undefined,
        powerFactor: powerFactor !== undefined ? Number(powerFactor) : undefined,
        frequency: frequency !== undefined ? Number(frequency) : undefined,
        timestamp,
      });
      res.status(201).json({ success: true, message: 'Reading ingested and processed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const metersController = new MetersController();
