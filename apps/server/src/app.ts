import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './config/logger';
import { setupSwagger } from './config/swagger';
import { metricsMiddleware } from './middleware/metrics';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import meterRoutes from './modules/meters/meters.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import transformerRoutes from './modules/transformers/transformers.routes';
import auditRoutes from './modules/audit/audit.routes';
import systemRoutes from './modules/system/system.routes';
import consumerRoutes from './modules/consumers/consumers.routes';
import reportRoutes from './modules/reports/reports.routes';
import monitoringRoutes from './modules/monitoring/monitoring.routes';
import gridRoutes from './modules/grid/grid.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import billingRoutes from './modules/billing/billing.routes';
import saasRoutes from './modules/saas/saas.routes';
import copilotRoutes from './modules/copilot/copilot.routes';
import integrationRoutes from './modules/integration/integration.routes';

const app = express();

// ── Security ─────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for dev
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Body Parsing & Compression ───────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Metrics Collection ───────────────────────────────
app.use(metricsMiddleware);

// ── Request Logging ──────────────────────────────────
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')?.substring(0, 100),
  });
  next();
});

// ── Health Check ─────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'powerguard-server' });
});

// ── API Routes ───────────────────────────────────
setupSwagger(app);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transformers', transformerRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/consumers', consumerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/grid', gridRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/integration', integrationRoutes);

// ── Error Handling ───────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
