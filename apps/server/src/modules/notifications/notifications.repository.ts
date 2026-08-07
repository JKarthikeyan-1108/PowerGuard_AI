import prisma from '../../config/database';
import { CreateNotificationDTO, GetNotificationsQuery } from './notifications.types';
import { Prisma } from '@prisma/client';

export class NotificationsRepository {
  async createNotification(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        read: false
      }
    });
  }

  async getNotifications(userId: string, query: GetNotificationsQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      deletedAt: null,
      ...(query.unreadOnly === 'true' && { read: false })
    };

    const [total, data, unreadCount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: { userId, deletedAt: null, read: false } })
    ]);

    return { data, total, unreadCount, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  async deleteNotification(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { deletedAt: new Date() }
    });
  }

  // User Preferences
  async getUserPreferences(userId: string) {
    let prefs = await prisma.userPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.userPreference.create({ data: { userId } });
    }
    return prefs;
  }

  async updateUserPreferences(userId: string, data: any) {
    return prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
