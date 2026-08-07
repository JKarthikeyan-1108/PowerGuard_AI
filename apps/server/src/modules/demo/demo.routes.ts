// ─────────────────────────────────────────────────────────
// PowerGuard — Demo Mode API Routes
// Enable/disable demo mode, trigger scenarios, get status
// ─────────────────────────────────────────────────────────

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { demoService, DemoScenario } from '../../services/demo.service';
import logger from '../../config/logger';

const router = Router();

// All demo routes require admin
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/demo/status — Current demo mode state
router.get('/status', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: demoService.getState() });
});

// GET /api/demo/scenarios — List all available scenarios
router.get('/scenarios', (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: demoService.getScenarios() });
});

// POST /api/demo/enable — Start demo mode with chosen scenarios
router.post('/enable', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { scenarios, speed } = req.body;

    const validScenarios: DemoScenario[] = [
      'ELECTRICITY_THEFT', 'METER_TAMPERING', 'TRANSFORMER_FAILURE',
      'VOLTAGE_DROP', 'CURRENT_SPIKE', 'HIGH_BILL', 'POWER_OUTAGE',
      'DEMAND_FORECAST', 'ENERGY_RECOMMENDATIONS', 'NORMAL_OPERATION',
    ];

    const requested: DemoScenario[] = (scenarios || ['NORMAL_OPERATION']).filter(
      (s: string) => validScenarios.includes(s as DemoScenario)
    );

    const validSpeeds = ['SLOW', 'NORMAL', 'FAST'];
    const selectedSpeed = validSpeeds.includes(speed) ? speed : 'NORMAL';

    logger.info(`🎭 Admin ${req.user?.email} enabled demo mode: [${requested.join(', ')}]`);

    const state = await demoService.enable(requested, selectedSpeed);
    res.json({ success: true, message: 'Demo mode enabled', data: state });
  } catch (error) {
    next(error);
  }
});

// POST /api/demo/disable — Stop demo mode
router.post('/disable', (req: AuthRequest, res: Response) => {
  logger.info(`🎭 Admin ${req.user?.email} disabled demo mode`);
  const stats = demoService.disable();
  res.json({ success: true, message: 'Demo mode disabled', data: stats });
});

// POST /api/demo/presentation — Run full presentation sequence
router.post('/presentation', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`🎭 Admin ${req.user?.email} triggered presentation sequence`);
    const result = await demoService.runPresentationSequence();
    res.json({ success: true, message: 'Presentation sequence complete', data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/demo/scenario/:name — Trigger a single scenario burst
router.post('/scenario/:name', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scenarioName = req.params.name as DemoScenario;
    const { duration = 10000, speed = 'FAST' } = req.body;

    logger.info(`🎭 Running single scenario: ${scenarioName} for ${duration}ms`);

    const state = await demoService.enable([scenarioName], speed);

    // Auto-disable after duration
    setTimeout(() => {
      demoService.disable();
    }, Math.min(duration, 60000)); // Max 60 seconds

    res.json({ success: true, message: `Scenario ${scenarioName} running`, data: state });
  } catch (error) {
    next(error);
  }
});

export default router;
