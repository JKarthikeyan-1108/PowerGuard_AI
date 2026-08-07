import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { incidentsService } from './incidents.service';

export class IncidentsController {
  async createIncident(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.createIncident(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  async getIncidents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await incidentsService.getIncidents(req.query as any);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getIncidentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.getIncidentById(req.params.id as string);
      res.status(200).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  async updateIncident(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.updateIncident(req.params.id as string, req.body);
      res.status(200).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await incidentsService.addComment(req.params.id as string, req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: comment });
    } catch (error) {
      next(error);
    }
  }
}

export const incidentsController = new IncidentsController();
