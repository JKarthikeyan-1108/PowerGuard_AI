// ─────────────────────────────────────────────────────────
// PowerGuard — Monitoring Routes
// Health check, metrics, and observability endpoints
// ─────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { monitoringService, metricsCollector } from '../../services/monitoring.service';
import logger from '../../config/logger';

const router = Router();

// ── Public Health Endpoints (No Auth) ───────────────────
// Kubernetes/Docker/load-balancer liveness probe
router.get('/health/live', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'powerguard-server',
    version: '1.0.0',
  });
});

// Readiness probe — checks DB connectivity
router.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    const dbHealth = await monitoringService.checkDatabaseHealth();
    if (dbHealth.status === 'DOWN') {
      res.status(503).json({
        status: 'not_ready',
        reason: 'Database unavailable',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: dbHealth.status,
      latencyMs: dbHealth.latencyMs,
    });
  } catch (error: any) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});

// ── Protected Monitoring Endpoints (Admin Only) ─────────
router.use(authenticate);
router.use(authorize('ADMIN'));

// Full health dashboard with all subsystems
router.get('/dashboard', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await monitoringService.getHealthDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
});

// System metrics only (CPU, RAM, disk, network)
router.get('/system', (_req: AuthRequest, res: Response) => {
  const metrics = monitoringService.getSystemMetrics();
  res.json({ success: true, data: metrics });
});

// API performance metrics
router.get('/api-metrics', (_req: AuthRequest, res: Response) => {
  const metrics = metricsCollector.getApiMetrics();
  res.json({ success: true, data: metrics });
});

// MQTT broker metrics
router.get('/mqtt', (_req: AuthRequest, res: Response) => {
  const metrics = metricsCollector.getMqttMetrics();
  res.json({ success: true, data: metrics });
});

// Socket.IO metrics
router.get('/socket', (_req: AuthRequest, res: Response) => {
  const metrics = metricsCollector.getSocketMetrics();
  res.json({ success: true, data: metrics });
});

// AI service metrics
router.get('/ai', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await monitoringService.checkAiHealth();
    res.json({ success: true, data: result.metrics });
  } catch (error) {
    next(error);
  }
});

// Device/meter metrics
router.get('/devices', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await monitoringService.getDeviceMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});

// Time-series metrics history for charts
router.get('/history', (_req: AuthRequest, res: Response) => {
  const history = monitoringService.getMetricsHistory();
  res.json({ success: true, data: history });
});

// Service status summary
router.get('/services', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await monitoringService.getHealthDashboard();
    res.json({ success: true, data: dashboard.services });
  } catch (error) {
    next(error);
  }
});

export default router;
