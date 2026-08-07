import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { systemController } from './system.controller';
import { getSystemLogsSchema } from './system.validator';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN')); // System APIs are typically Admin only

// GET /api/system/health — Real-time health metrics
router.get('/health', systemController.getHealth);

// GET /api/system/logs — Fetch system logs
router.get('/logs', validate(getSystemLogsSchema, 'query'), systemController.getLogs);

// GET /api/system/settings — Fetch system-wide settings
router.get('/settings', systemController.getSettings);

export default router;
