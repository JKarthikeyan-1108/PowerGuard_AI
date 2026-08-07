import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { metersController } from './meters.controller';
import { getMetersSchema, getReadingsSchema, updateMeterStatusSchema } from './meters.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/meters — Admin or Utility Officer
router.get('/', authorize('ADMIN', 'UTILITY_OFFICER'), validate(getMetersSchema, 'query'), metersController.getMeters);

// GET /api/meters/:id/readings — Get historical readings for a meter
router.get('/:id/readings', validate(getReadingsSchema, 'query'), metersController.getMeterReadings);

// PUT /api/meters/:id/status — Admin or Utility Officer update status
router.put('/:id/status', authorize('ADMIN', 'UTILITY_OFFICER'), validate(updateMeterStatusSchema), metersController.updateMeterStatus);

export default router;
