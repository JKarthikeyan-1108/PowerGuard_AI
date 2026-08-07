import { Router } from 'express';
import { copilotController } from './copilot.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireTenant, optionalTenant } from '../../middleware/tenant';

const router = Router();

// Ensure user is authenticated, and try to attach tenant context
router.use(authenticate, optionalTenant);

router.post('/chat', copilotController.handleChat);

export default router;
