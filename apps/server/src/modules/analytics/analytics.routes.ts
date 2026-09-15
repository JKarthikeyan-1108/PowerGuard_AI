import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { analyticsController } from './analytics.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'UTILITY_OFFICER', 'CONSUMER'));

// GET /api/analytics/overview — Overview metrics for dashboard
router.get('/overview', analyticsController.getDashboardOverview);

// GET /api/analytics/theft-heatmap — Geo-data for theft risks
router.get('/theft-heatmap', analyticsController.getTheftHeatmap);

// GET /api/analytics/forecast — Demand forecast data
router.get('/forecast', analyticsController.getForecast);

// GET /api/analytics/consumer/realtime-power
router.get('/consumer/realtime-power', analyticsController.getConsumerRealtimePower);

// GET /api/analytics/consumer/consumption
router.get('/consumer/consumption', analyticsController.getConsumerConsumptionHistory);

// GET /api/analytics/consumer/bills
router.get('/consumer/bills', analyticsController.getConsumerBillHistory);

// GET /api/analytics/theft-alerts
router.get('/theft-alerts', analyticsController.getActiveTheftAlerts);

// GET /api/analytics/utility/charts
router.get('/utility/charts', analyticsController.getUtilityCharts);

export default router;
