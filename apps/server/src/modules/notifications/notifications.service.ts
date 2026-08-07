import { notificationsRepository } from './notifications.repository';
import { CreateNotificationDTO, GetNotificationsQuery } from './notifications.types';
import { socketService } from '../../services/socket.service';
import { emailService } from '../../services/email.service';

export class NotificationsService {
  async sendNotification(data: CreateNotificationDTO) {
    const prefs = await notificationsRepository.getUserPreferences(data.userId);
    
    // 1. In-App Notification (Database + Socket)
    let notification = null;
    if (prefs.inAppEnabled) {
      notification = await notificationsRepository.createNotification(data);
      socketService.emitToUser(data.userId, 'new_notification', notification);
    }

    // 2. Email Notification
    if (prefs.emailEnabled && (data.channels || '').includes('EMAIL')) {
      // Find user email via a relation or pass it in. For now, assume mock sending
      // emailService.sendMail({ to: '...', subject: data.title, text: data.body });
    }

    // 3. Web Push (Placeholder)
    if (prefs.pushEnabled && (data.channels || '').includes('PUSH')) {
      // pushService.send(...)
    }

    return notification;
  }

  async getNotifications(userId: string, query: GetNotificationsQuery) {
    return notificationsRepository.getNotifications(userId, query);
  }

  async markAsRead(id: string, userId: string) {
    return notificationsRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationsRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string) {
    return notificationsRepository.deleteNotification(id, userId);
  }

  async getUserPreferences(userId: string) {
    return notificationsRepository.getUserPreferences(userId);
  }

  async updateUserPreferences(userId: string, data: any) {
    return notificationsRepository.updateUserPreferences(userId, data);
  }
}

export const notificationsService = new NotificationsService();
