import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// Consumer routes
router.get('/consumer/:consumerId', authorize('CONSUMER', 'ADMIN'), billingController.getConsumerBills);

// Admin routes
router.post('/generate', authorize('ADMIN'), billingController.generateBills);
router.get('/tariffs', authorize('ADMIN', 'CONSUMER'), billingController.getTariffPlans);

export default router;
