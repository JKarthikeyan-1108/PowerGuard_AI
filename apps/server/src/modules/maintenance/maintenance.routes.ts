import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'UTILITY_OFFICER'));

router.get('/dashboard', maintenanceController.getDashboard);
router.put('/schedules/:id/assign', maintenanceController.assignTechnician);

export default router;
