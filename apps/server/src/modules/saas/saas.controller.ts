import { Request, Response, NextFunction } from 'express';
import { saasService } from './saas.service';

export class SaasController {
  
  public getOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await saasService.getOrganizations();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await saasService.createOrganization(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await saasService.getSubscriptionPlans();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export const saasController = new SaasController();
