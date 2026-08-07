import { Request, Response, NextFunction } from 'express';
import { integrationService } from './integration.service';
import logger from '../../config/logger';

export class IntegrationController {
  
  public uploadMeters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      
      const tenantId = req.tenantId || req.user?.organizationId;
      if (!tenantId) {
        res.status(403).json({ success: false, error: 'Missing tenant context' });
        return;
      }

      const result = await integrationService.importMeters(req.file.path, tenantId, req.file.mimetype);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('File upload error', error);
      res.status(500).json({ success: false, error: 'Failed to process file' });
    }
  };

  public exportAlertsCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.tenantId || req.user?.organizationId;
      if (!tenantId) {
        res.status(403).json({ success: false, error: 'Missing tenant context' });
        return;
      }

      const csvData = await integrationService.exportAlerts(tenantId);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="alerts_export.csv"');
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  };

  public handleScadaTelemetry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // This endpoint expects API Key authentication (x-api-key)
      const scopes = req.apiScopes || [];
      if (!scopes.includes('scada:write')) {
        res.status(403).json({ success: false, error: 'Insufficient API Key scopes. Requires scada:write' });
        return;
      }

      // In a real implementation, this would rapidly ingest bulk telemetry arrays from SCADA RTUs
      const { data } = req.body;
      logger.info(`Received SCADA telemetry batch for tenant ${req.tenantId}. Items: ${data?.length || 0}`);
      
      res.status(202).json({ success: true, message: 'Telemetry accepted for processing' });
    } catch (error) {
      next(error);
    }
  };
}

export const integrationController = new IntegrationController();
