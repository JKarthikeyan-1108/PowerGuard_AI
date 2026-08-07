import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { auditService } from './audit.service';

export class AuditController {
  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditService.getAuditLogs(req.query as Record<string, string>);
      res.json({ success: true, data: result.logs, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getActions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actions = await auditService.getUniqueActions();
      res.json({ success: true, data: actions });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
