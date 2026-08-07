import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { notificationsController } from './notifications.controller';
import { createNotificationSchema, getNotificationsSchema } from './notifications.validator';

const router = Router();
router.use(authenticate);

// Preferences
router.get('/preferences', notificationsController.getPreferences);
router.patch('/preferences', notificationsController.updatePreferences);

// Notifications
router.get('/', validate(getNotificationsSchema, 'query'), notificationsController.getNotifications);
router.post('/', validate(createNotificationSchema), notificationsController.sendNotification); // Can be constrained by authorize('ADMIN') later
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.deleteNotification);

export default router;
