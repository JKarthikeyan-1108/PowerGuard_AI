import { Router } from 'express';
import multer from 'multer';
import { integrationController } from './integration.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { requireApiKey } from '../../middleware/apiKey';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// --- M2M Integration Routes (API Key Auth) ---
// Used by external ERP/SCADA/GIS systems pushing data to PowerGuard
router.post('/scada/telemetry', requireApiKey, integrationController.handleScadaTelemetry);

// --- User Integration Routes (JWT Auth) ---
// Used by Admins in the Web App to upload files or export data
router.use('/web', authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
router.post('/web/import/meters', upload.single('file'), integrationController.uploadMeters);
router.get('/web/export/alerts', integrationController.exportAlertsCsv);

export default router;
