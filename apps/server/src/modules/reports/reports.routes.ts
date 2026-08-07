import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { reportsController } from './reports.controller';
import { downloadReportSchema } from './reports.validator';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
router.use(authenticate);

// GET /api/reports/download — Download a report
router.get('/download', validate(downloadReportSchema, 'query'), reportsController.downloadReport);

// POST /api/reports/schedule — Subscribe to reports
router.post('/schedule', reportsController.scheduleReport);

export default router;
