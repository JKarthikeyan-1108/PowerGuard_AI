import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { consumersController } from './consumers.controller';
import { getConsumersSchema } from './consumers.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/consumers — Utility Officer or Admin
router.get('/', authorize('UTILITY_OFFICER', 'ADMIN'), validate(getConsumersSchema, 'query'), consumersController.getConsumers);

// GET /api/consumers/:id — Access specific consumer profile (Admin/Utility or self)
router.get('/:id', consumersController.getConsumerById);

export default router;
