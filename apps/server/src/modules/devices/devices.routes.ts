import { Router } from 'express';
import { DevicesController } from './devices.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
const controller = new DevicesController();

router.use(authenticate);
router.use(authorize('ADMIN', 'UTILITY_OFFICER'));

router.post('/:id/restart', controller.restartDevice.bind(controller));
router.post('/:id/config', controller.syncConfig.bind(controller));
router.post('/:id/update', controller.updateFirmware.bind(controller));
router.get('/:id/logs', controller.getDeviceLogs.bind(controller));
router.get('/:id/config', controller.getDeviceConfig.bind(controller));

export default router;
