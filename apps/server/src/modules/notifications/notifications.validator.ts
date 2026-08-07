import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  channels: z.string().optional(),
  actionUrl: z.string().url().optional(),
});

export const getNotificationsSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  unreadOnly: z.string().optional(), // 'true' | 'false'
});
