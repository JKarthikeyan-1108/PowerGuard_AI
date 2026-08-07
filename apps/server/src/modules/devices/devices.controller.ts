import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { devicesService } from './devices.service';

export class DevicesController {
  async restartDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await devicesService.restartDevice(req.params.id);
      res.status(200).json({ status: 'success', message: 'Restart command sent' });
    } catch (error) {
      next(error);
    }
  }

  async syncConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await devicesService.syncConfig(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: config, message: 'Configuration synced' });
    } catch (error) {
      next(error);
    }
  }

  async updateFirmware(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await devicesService.updateFirmware(req.params.id, req.body.firmwareUrl, req.body.version);
      res.status(200).json({ status: 'success', message: 'Firmware update initiated' });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await devicesService.getDeviceLogs(req.params.id);
      res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await devicesService.getDeviceConfig(req.params.id);
      res.status(200).json({ status: 'success', data: config });
    } catch (error) {
      next(error);
    }
  }
}
