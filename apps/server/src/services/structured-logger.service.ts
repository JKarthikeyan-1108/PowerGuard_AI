// ─────────────────────────────────────────────────────────
// PowerGuard — Structured Logging Service
// Production-grade logging: request, error, security,
// MQTT, AI, and audit logs with JSON structure
// ─────────────────────────────────────────────────────────

import winston from 'winston';
import path from 'path';
import config from '../config';
import fs from 'fs';

const logDir = config.logging.dir;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ── Custom Format ───────────────────────────────────────

const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Category Loggers ────────────────────────────────────

function createCategoryLogger(category: string, filename: string) {
  return winston.createLogger({
    level: config.logging.level,
    format: structuredFormat,
    defaultMeta: { service: 'powerguard-server', category },
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, filename),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        tailable: true,
      }),
    ],
  });
}

// Individual category loggers
const requestLogger = createCategoryLogger('request', 'request.log');
const errorLogger = createCategoryLogger('error', 'error.log');
const securityLogger = createCategoryLogger('security', 'security.log');
const mqttLogger = createCategoryLogger('mqtt', 'mqtt.log');
const aiLogger = createCategoryLogger('ai', 'ai.log');
const auditLogger = createCategoryLogger('audit', 'audit.log');

// ── Structured Log API ──────────────────────────────────

export const structuredLog = {
  // Request logging - every HTTP request
  request(data: {
    method: string;
    path: string;
    statusCode: number;
    responseTimeMs: number;
    ip?: string;
    userId?: string;
    userAgent?: string;
    contentLength?: number;
    query?: Record<string, any>;
  }) {
    const level = data.statusCode >= 500 ? 'error' : data.statusCode >= 400 ? 'warn' : 'info';
    requestLogger.log(level, `${data.method} ${data.path} ${data.statusCode} ${data.responseTimeMs}ms`, {
      ...data,
      type: 'HTTP_REQUEST',
    });
  },

  // Error logging - application errors
  error(data: {
    error: string;
    stack?: string;
    context?: string;
    path?: string;
    method?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) {
    errorLogger.error(data.error, {
      ...data,
      type: 'APPLICATION_ERROR',
    });
  },

  // Security logging - auth events, rate limits, suspicious activity
  security(data: {
    event: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'TOKEN_REFRESH' | 'TOKEN_INVALID' |
           'RATE_LIMIT_HIT' | 'BRUTE_FORCE_DETECTED' | 'UNAUTHORIZED_ACCESS' |
           'ROLE_VIOLATION' | 'ACCOUNT_LOCKED' | 'PASSWORD_RESET' | 'SUSPICIOUS_ACTIVITY';
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    details?: string;
    metadata?: Record<string, any>;
  }) {
    const level = ['LOGIN_FAILURE', 'BRUTE_FORCE_DETECTED', 'UNAUTHORIZED_ACCESS', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY']
      .includes(data.event) ? 'warn' : 'info';
    securityLogger.log(level, `SECURITY: ${data.event}`, {
      ...data,
      type: 'SECURITY_EVENT',
    });
  },

  // MQTT logging - broker events, messages, errors
  mqtt(data: {
    event: 'CONNECT' | 'DISCONNECT' | 'RECONNECT' | 'MESSAGE' | 'SUBSCRIBE' | 'ERROR' | 'PUBLISH';
    topic?: string;
    serialNumber?: string;
    messageType?: string;
    details?: string;
    error?: string;
  }) {
    const level = data.event === 'ERROR' ? 'error' : data.event === 'RECONNECT' ? 'warn' : 'info';
    mqttLogger.log(level, `MQTT: ${data.event}${data.topic ? ` [${data.topic}]` : ''}`, {
      ...data,
      type: 'MQTT_EVENT',
    });
  },

  // AI logging - predictions, training, model events
  ai(data: {
    event: 'PREDICTION' | 'TRAINING_START' | 'TRAINING_COMPLETE' | 'MODEL_LOAD' |
           'MODEL_ERROR' | 'INFERENCE_SLOW' | 'ACCURACY_ALERT';
    model?: string;
    meterId?: string;
    consumerId?: string;
    inferenceTimeMs?: number;
    result?: Record<string, any>;
    error?: string;
  }) {
    const level = ['MODEL_ERROR', 'INFERENCE_SLOW', 'ACCURACY_ALERT'].includes(data.event) ? 'warn' : 'info';
    aiLogger.log(level, `AI: ${data.event}${data.model ? ` [${data.model}]` : ''}`, {
      ...data,
      type: 'AI_EVENT',
    });
  },

  // Audit logging - data changes, admin actions
  audit(data: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    userEmail?: string;
    changes?: { field: string; from: any; to: any }[];
    ip?: string;
    details?: string;
  }) {
    auditLogger.info(`AUDIT: ${data.action} ${data.resource}`, {
      ...data,
      type: 'AUDIT_EVENT',
    });
  },
};

export default structuredLog;
