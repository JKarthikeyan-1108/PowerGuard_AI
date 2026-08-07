import { Router } from 'express';
import { gridController } from './grid.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Only Admins and Utility Officers can view the grid topology
router.use(authenticate);
router.use(authorize('ADMIN', 'UTILITY_OFFICER'));

router.get('/topology', gridController.getTopology);

export default router;
