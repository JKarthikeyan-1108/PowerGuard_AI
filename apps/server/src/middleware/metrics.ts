// ─────────────────────────────────────────────────────────
// PowerGuard — Request Metrics Middleware
// Captures response time, status code, and feeds the
// MetricsCollector and structured logger
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../services/monitoring.service';
import { structuredLog } from '../services/structured-logger.service';
import { AuthRequest } from './authenticate';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();

  // Hook into res.end to capture timing
  const originalEnd = res.end;
  res.end = function (this: Response, ...args: any[]) {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e6; // ms
    const responseTimeMs = Math.round(elapsed * 100) / 100;

    // Record in metrics collector
    metricsCollector.recordRequest({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTimeMs,
      timestamp: Date.now(),
    });

    // Structured request log
    structuredLog.request({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs,
      ip: req.ip || req.socket.remoteAddress,
      userId: (req as AuthRequest).user?.id,
      userAgent: req.get('user-agent')?.substring(0, 200),
      contentLength: parseInt(res.get('content-length') || '0', 10) || undefined,
    });

    return originalEnd.apply(this, args as any);
  } as any;

  next();
};
