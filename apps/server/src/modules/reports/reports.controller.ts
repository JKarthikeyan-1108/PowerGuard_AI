import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
  async downloadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { buffer, contentType, filename } = await reportsService.generateReport(req.query);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async scheduleReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { frequency } = req.body; // 'DAILY', 'WEEKLY', 'MONTHLY'
      // Mock saving logic
      res.json({ message: `Successfully subscribed to ${frequency} reports` });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
