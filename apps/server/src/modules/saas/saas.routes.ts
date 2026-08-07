import { Router } from 'express';
import { saasController } from './saas.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// In a real app we'd have a SUPER_ADMIN role for platform owners. 
// For this demo phase, we allow ADMIN to hit these.
router.use(authenticate, authorize('ADMIN'));

router.get('/organizations', saasController.getOrganizations);
router.post('/organizations', saasController.createOrganization);
router.get('/plans', saasController.getSubscriptionPlans);

export default router;
