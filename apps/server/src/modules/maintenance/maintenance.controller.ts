import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from './maintenance.service';
import logger from '../../config/logger';

export class MaintenanceController {
  public getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // For demo purposes, we trigger the assessment on dashboard load
      // In production, this would be a daily cron job.
      await maintenanceService.assessTransformerHealth();
      
      const data = await maintenanceService.getDashboardData();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error(`Error in MaintenanceController.getDashboard: ${error.message}`);
      next(error);
    }
  };

  public assignTechnician = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const technicianId = req.body.technicianId as string;
      const data = await maintenanceService.assignTechnician(id as string, technicianId);
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const maintenanceController = new MaintenanceController();
