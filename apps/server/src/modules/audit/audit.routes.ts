import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditController } from './audit.controller';
import { getAuditLogsSchema } from './audit.validator';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/audit-logs
router.get('/', validate(getAuditLogsSchema, 'query'), auditController.getAuditLogs);

// GET /api/audit-logs/actions — List unique action types
router.get('/actions', auditController.getActions);

export default router;
