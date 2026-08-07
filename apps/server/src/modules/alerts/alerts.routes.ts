import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { alertsController } from './alerts.controller';
import { getAlertsSchema, updateAlertStatusSchema, createAlertSchema } from './alerts.validator';

const router = Router();
router.use(authenticate);

// GET /api/alerts — Admin/Utility Officer get all, Consumer gets their own
router.get('/', validate(getAlertsSchema, 'query'), alertsController.getAlerts);

// POST /api/alerts — System/Admin create alert programmatically
router.post('/', authorize('ADMIN', 'UTILITY_OFFICER'), validate(createAlertSchema), alertsController.createAlert);

// PUT /api/alerts/:id/status — Admin/Utility Officer transition alert status
router.put('/:id/status', authorize('ADMIN', 'UTILITY_OFFICER'), validate(updateAlertStatusSchema), alertsController.updateAlertStatus);

// PATCH /api/alerts/:id/resolve — Admin/Utility Officer quick resolve
router.patch('/:id/resolve', authorize('ADMIN', 'UTILITY_OFFICER'), (req, res, next) => {
  req.body.status = 'RESOLVED';
  alertsController.updateAlertStatus(req, res, next);
});

export default router;
