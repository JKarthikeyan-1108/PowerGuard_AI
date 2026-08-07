import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  async sendNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.sendNotification(req.body);
      res.status(201).json({ status: 'success', data: notification });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.getNotifications(req.user!.id, req.query as any);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.params.id as string, req.user!.id);
      res.status(200).json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.deleteNotification(req.params.id as string, req.user!.id);
      res.status(200).json({ status: 'success', message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationsService.getUserPreferences(req.user!.id);
      res.status(200).json({ status: 'success', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationsService.updateUserPreferences(req.user!.id, req.body);
      res.status(200).json({ status: 'success', data: prefs });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
