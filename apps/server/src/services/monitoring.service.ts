// ─────────────────────────────────────────────────────────
// PowerGuard — Monitoring & Observability Service
// Enterprise-grade metrics collection across all subsystems
// ─────────────────────────────────────────────────────────

import os from 'os';
import axios from 'axios';
import prisma from '../config/database';
import config from '../config';
import logger from '../config/logger';

// ── Types ────────────────────────────────────────────────

export interface ServiceStatus {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  latencyMs: number;
  uptime: string;
  version?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface SystemMetrics {
  cpu: { usagePercent: number; cores: number; model: string; loadAvg: number[] };
  memory: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number };
  disk: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number };
  network: { hostname: string; interfaces: { name: string; address: string }[] };
  process: { pid: number; uptimeSeconds: number; memoryMB: number; nodeVersion: string };
}

export interface ApiMetrics {
  totalRequests: number;
  requestsPerMinute: number;
  avgResponseTimeMs: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  slowestEndpoints: { path: string; avgMs: number; count: number }[];
}

export interface DeviceMetrics {
  totalMeters: number;
  activeMeters: number;
  offlineMeters: number;
  faultyMeters: number;
  tamperedMeters: number;
  connectedNow: number;
  recentReadings: number;
  readingsPerMinute: number;
}

export interface AiMetrics {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  modelsLoaded: number;
  totalPredictions: number;
  avgInferenceTimeMs: number;
  models: { name: string; version: string; status: string; accuracy?: number }[];
}

export interface MqttMetrics {
  connected: boolean;
  messagesReceived: number;
  messagesPerMinute: number;
  topicsSubscribed: number;
  lastMessageAt: string | null;
  reconnects: number;
}

export interface SocketMetrics {
  connected: boolean;
  totalConnections: number;
  namespaceCounts: Record<string, number>;
  roomCount: number;
}

export interface HealthDashboard {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  score: number; // 0-100
  timestamp: string;
  services: ServiceStatus[];
  system: SystemMetrics;
  api: ApiMetrics;
  devices: DeviceMetrics;
  ai: AiMetrics;
  mqtt: MqttMetrics;
  socket: SocketMetrics;
}

// ── In-Memory Metrics Collectors ─────────────────────────

interface RequestLogEntry {
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  timestamp: number;
}

class MetricsCollector {
  private requestLog: RequestLogEntry[] = [];
  private mqttMessageCount = 0;
  private mqttLastMessageAt: number | null = null;
  private mqttReconnects = 0;
  private mqttConnected = false;
  private mqttTopicCount = 0;
  private aiInferenceTimes: number[] = [];
  private aiPredictionCount = 0;
  private socketConnections = 0;
  private socketNamespaces: Record<string, number> = {};
  private socketRoomCount = 0;
  private readonly MAX_LOG_SIZE = 10000;
  private readonly WINDOW_MS = 5 * 60 * 1000; // 5-minute rolling window

  // ── Request Tracking ──────────────────────────────────
  recordRequest(entry: RequestLogEntry) {
    this.requestLog.push(entry);
    if (this.requestLog.length > this.MAX_LOG_SIZE) {
      this.requestLog = this.requestLog.slice(-this.MAX_LOG_SIZE / 2);
    }
  }

  getApiMetrics(): ApiMetrics {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    const recentRequests = this.requestLog.filter(r => r.timestamp >= windowStart);
    const totalRequests = this.requestLog.length;
    const rpm = recentRequests.length / (this.WINDOW_MS / 60000);

    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((s, r) => s + r.responseTimeMs, 0) / recentRequests.length
      : 0;

    const errorCount = recentRequests.filter(r => r.statusCode >= 400).length;
    const errorRate = recentRequests.length > 0 ? (errorCount / recentRequests.length) * 100 : 0;

    // Status code distribution
    const statusCodes: Record<string, number> = {};
    recentRequests.forEach(r => {
      const bucket = `${Math.floor(r.statusCode / 100)}xx`;
      statusCodes[bucket] = (statusCodes[bucket] || 0) + 1;
    });

    // Slowest endpoints
    const endpointMap = new Map<string, { totalMs: number; count: number }>();
    recentRequests.forEach(r => {
      // Normalize path by removing UUIDs
      const normalized = r.path.replace(/[a-f0-9-]{36}/gi, ':id').replace(/\/\d+/g, '/:n');
      const key = `${r.method} ${normalized}`;
      const existing = endpointMap.get(key) || { totalMs: 0, count: 0 };
      existing.totalMs += r.responseTimeMs;
      existing.count++;
      endpointMap.set(key, existing);
    });

    const slowestEndpoints = Array.from(endpointMap.entries())
      .map(([path, data]) => ({ path, avgMs: Math.round(data.totalMs / data.count), count: data.count }))
      .sort((a, b) => b.avgMs - a.avgMs)
      .slice(0, 10);

    return {
      totalRequests,
      requestsPerMinute: Math.round(rpm * 100) / 100,
      avgResponseTimeMs: Math.round(avgResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      statusCodes,
      slowestEndpoints,
    };
  }

  // ── MQTT Tracking ─────────────────────────────────────
  recordMqttMessage() {
    this.mqttMessageCount++;
    this.mqttLastMessageAt = Date.now();
  }
  recordMqttReconnect() { this.mqttReconnects++; }
  setMqttConnected(connected: boolean) { this.mqttConnected = connected; }
  setMqttTopicCount(count: number) { this.mqttTopicCount = count; }

  getMqttMetrics(): MqttMetrics {
    return {
      connected: this.mqttConnected,
      messagesReceived: this.mqttMessageCount,
      messagesPerMinute: this.calculateRate(this.mqttMessageCount),
      topicsSubscribed: this.mqttTopicCount,
      lastMessageAt: this.mqttLastMessageAt ? new Date(this.mqttLastMessageAt).toISOString() : null,
      reconnects: this.mqttReconnects,
    };
  }

  // ── AI Tracking ───────────────────────────────────────
  recordAiInference(durationMs: number) {
    this.aiPredictionCount++;
    this.aiInferenceTimes.push(durationMs);
    if (this.aiInferenceTimes.length > 1000) {
      this.aiInferenceTimes = this.aiInferenceTimes.slice(-500);
    }
  }

  getAiInferenceStats() {
    const times = this.aiInferenceTimes;
    if (times.length === 0) return { avg: 0, count: this.aiPredictionCount };
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    return { avg: Math.round(avg * 100) / 100, count: this.aiPredictionCount };
  }

  // ── Socket.IO Tracking ────────────────────────────────
  setSocketStats(connections: number, namespaces: Record<string, number>, rooms: number) {
    this.socketConnections = connections;
    this.socketNamespaces = namespaces;
    this.socketRoomCount = rooms;
  }

  getSocketMetrics(): SocketMetrics {
    return {
      connected: true,
      totalConnections: this.socketConnections,
      namespaceCounts: this.socketNamespaces,
      roomCount: this.socketRoomCount,
    };
  }

  private calculateRate(total: number): number {
    const uptimeMinutes = process.uptime() / 60;
    if (uptimeMinutes < 1) return total;
    return Math.round((total / uptimeMinutes) * 100) / 100;
  }
}

// Singleton
export const metricsCollector = new MetricsCollector();

// ── Monitoring Service ──────────────────────────────────

class MonitoringService {
  private startTime = Date.now();

  // ── System Metrics ────────────────────────────────────
  getSystemMetrics(): SystemMetrics {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const loadAvg = os.loadavg();

    // CPU usage from cpus()
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = ((1 - totalIdle / totalTick) * 100);

    const mem = process.memoryUsage();

    return {
      cpu: {
        usagePercent: Math.round(cpuUsage * 100) / 100,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        loadAvg: loadAvg.map(l => Math.round(l * 100) / 100),
      },
      memory: {
        totalBytes: totalMem,
        usedBytes: usedMem,
        freeBytes: freeMem,
        usagePercent: Math.round((usedMem / totalMem) * 10000) / 100,
      },
      disk: {
        // Disk info requires platform-specific calls; provide estimates
        totalBytes: 0,
        usedBytes: 0,
        freeBytes: 0,
        usagePercent: 0,
      },
      network: {
        hostname: os.hostname(),
        interfaces: this.getNetworkInterfaces(),
      },
      process: {
        pid: process.pid,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryMB: Math.round(mem.rss / 1024 / 1024),
        nodeVersion: process.version,
      },
    };
  }

  private getNetworkInterfaces(): { name: string; address: string }[] {
    const nets = os.networkInterfaces();
    const results: { name: string; address: string }[] = [];
    for (const [name, interfaces] of Object.entries(nets)) {
      interfaces?.forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          results.push({ name, address: iface.address });
        }
      });
    }
    return results;
  }

  // ── Database Health ───────────────────────────────────
  async checkDatabaseHealth(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
      return {
        name: 'MySQL Database',
        status: latency < 500 ? 'HEALTHY' : 'DEGRADED',
        latencyMs: latency,
        uptime: this.formatUptime(uptimeSec),
        version: '8.0',
        lastChecked: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        name: 'MySQL Database',
        status: 'DOWN',
        latencyMs: Date.now() - start,
        uptime: '0s',
        details: { error: error.message },
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // ── AI Service Health ─────────────────────────────────
  async checkAiHealth(): Promise<{ service: ServiceStatus; metrics: AiMetrics }> {
    const start = Date.now();
    try {
      const [healthRes, modelsRes] = await Promise.all([
        axios.get(`${config.ai.serviceUrl}/health`, { timeout: 5000 }),
        axios.get(`${config.ai.serviceUrl}/api/ai/models`, { timeout: 5000 }).catch(() => null),
      ]);
      const latency = Date.now() - start;
      const inferenceStats = metricsCollector.getAiInferenceStats();

      const models = modelsRes?.data?.models || [];
      return {
        service: {
          name: 'FastAPI AI Engine',
          status: latency < 2000 ? 'HEALTHY' : 'DEGRADED',
          latencyMs: latency,
          uptime: this.formatUptime(Math.floor(process.uptime())),
          version: '2.0.0',
          details: { modelsLoaded: healthRes.data?.models_loaded || models.length },
          lastChecked: new Date().toISOString(),
        },
        metrics: {
          status: latency < 2000 ? 'HEALTHY' : 'DEGRADED',
          latencyMs: latency,
          modelsLoaded: models.length,
          totalPredictions: inferenceStats.count,
          avgInferenceTimeMs: inferenceStats.avg,
          models: models.map((m: any) => ({
            name: m.name,
            version: m.version,
            status: m.status || 'Active',
            accuracy: m.accuracy || m.r2_score || m.silhouette,
          })),
        },
      };
    } catch (error: any) {
      const inferenceStats = metricsCollector.getAiInferenceStats();
      return {
        service: {
          name: 'FastAPI AI Engine',
          status: 'DOWN',
          latencyMs: Date.now() - start,
          uptime: '0s',
          details: { error: error.message },
          lastChecked: new Date().toISOString(),
        },
        metrics: {
          status: 'DOWN',
          latencyMs: Date.now() - start,
          modelsLoaded: 0,
          totalPredictions: inferenceStats.count,
          avgInferenceTimeMs: inferenceStats.avg,
          models: [],
        },
      };
    }
  }

  // ── Device Metrics from DB ────────────────────────────
  async getDeviceMetrics(): Promise<DeviceMetrics> {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const [total, active, offline, faulty, tampered, recentReadings] = await Promise.all([
        prisma.meter.count({ where: { deletedAt: null } }),
        prisma.meter.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.meter.count({ where: { status: 'INACTIVE', deletedAt: null } }),
        prisma.meter.count({ where: { status: 'FAULTY', deletedAt: null } }),
        prisma.meter.count({ where: { status: 'TAMPERED', deletedAt: null } }),
        prisma.meterReading.count({ where: { timestamp: { gte: fiveMinAgo } } }),
      ]);

      return {
        totalMeters: total,
        activeMeters: active,
        offlineMeters: offline,
        faultyMeters: faulty,
        tamperedMeters: tampered,
        connectedNow: active,
        recentReadings,
        readingsPerMinute: Math.round(recentReadings / 5),
      };
    } catch (error: any) {
      logger.error(`[Monitoring] Device metrics error: ${error.message}`);
      return {
        totalMeters: 0, activeMeters: 0, offlineMeters: 0,
        faultyMeters: 0, tamperedMeters: 0, connectedNow: 0,
        recentReadings: 0, readingsPerMinute: 0,
      };
    }
  }

  // ── Full Health Dashboard ─────────────────────────────
  async getHealthDashboard(): Promise<HealthDashboard> {
    const [dbHealth, aiHealth, deviceMetrics] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkAiHealth(),
      this.getDeviceMetrics(),
    ]);

    const systemMetrics = this.getSystemMetrics();
    const apiMetrics = metricsCollector.getApiMetrics();
    const mqttMetrics = metricsCollector.getMqttMetrics();
    const socketMetrics = metricsCollector.getSocketMetrics();

    const serverUptime = Math.floor(process.uptime());
    const serverStatus: ServiceStatus = {
      name: 'Node.js API Server',
      status: 'HEALTHY',
      latencyMs: apiMetrics.avgResponseTimeMs,
      uptime: this.formatUptime(serverUptime),
      version: '1.0.0',
      details: { pid: process.pid, nodeVersion: process.version },
      lastChecked: new Date().toISOString(),
    };

    const mqttServiceStatus: ServiceStatus = {
      name: 'MQTT Broker',
      status: mqttMetrics.connected ? 'HEALTHY' : 'DOWN',
      latencyMs: 0,
      uptime: this.formatUptime(serverUptime),
      details: {
        messagesReceived: mqttMetrics.messagesReceived,
        topicsSubscribed: mqttMetrics.topicsSubscribed,
      },
      lastChecked: new Date().toISOString(),
    };

    const socketServiceStatus: ServiceStatus = {
      name: 'Socket.IO Gateway',
      status: 'HEALTHY',
      latencyMs: 0,
      uptime: this.formatUptime(serverUptime),
      details: {
        totalConnections: socketMetrics.totalConnections,
        rooms: socketMetrics.roomCount,
      },
      lastChecked: new Date().toISOString(),
    };

    const services = [serverStatus, dbHealth, aiHealth.service, mqttServiceStatus, socketServiceStatus];

    // Calculate overall health score
    const score = this.calculateHealthScore(services, systemMetrics, apiMetrics);
    const overall = score >= 80 ? 'HEALTHY' : score >= 50 ? 'DEGRADED' : 'DOWN';

    return {
      overall,
      score,
      timestamp: new Date().toISOString(),
      services,
      system: systemMetrics,
      api: apiMetrics,
      devices: deviceMetrics,
      ai: aiHealth.metrics,
      mqtt: mqttMetrics,
      socket: socketMetrics,
    };
  }

  private calculateHealthScore(
    services: ServiceStatus[],
    system: SystemMetrics,
    api: ApiMetrics
  ): number {
    let score = 100;

    // Service status: -15 per DOWN, -5 per DEGRADED
    services.forEach(s => {
      if (s.status === 'DOWN') score -= 15;
      else if (s.status === 'DEGRADED') score -= 5;
    });

    // High CPU: deduct up to 10
    if (system.cpu.usagePercent > 90) score -= 10;
    else if (system.cpu.usagePercent > 75) score -= 5;

    // High memory: deduct up to 10
    if (system.memory.usagePercent > 90) score -= 10;
    else if (system.memory.usagePercent > 80) score -= 5;

    // High error rate: deduct up to 15
    if (api.errorRate > 10) score -= 15;
    else if (api.errorRate > 5) score -= 8;

    // Slow response: deduct up to 10
    if (api.avgResponseTimeMs > 2000) score -= 10;
    else if (api.avgResponseTimeMs > 500) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // ── Metrics History (for sparklines) ──────────────────
  private metricsHistory: { timestamp: number; cpu: number; memory: number; rpm: number; errorRate: number }[] = [];

  recordSnapshot() {
    const sys = this.getSystemMetrics();
    const api = metricsCollector.getApiMetrics();
    this.metricsHistory.push({
      timestamp: Date.now(),
      cpu: sys.cpu.usagePercent,
      memory: sys.memory.usagePercent,
      rpm: api.requestsPerMinute,
      errorRate: api.errorRate,
    });
    // Keep last 60 snapshots (5 minutes at 5-second intervals, or 1 hour at 1-min intervals)
    if (this.metricsHistory.length > 120) {
      this.metricsHistory = this.metricsHistory.slice(-120);
    }
  }

  getMetricsHistory() {
    return this.metricsHistory.map(m => ({
      time: new Date(m.timestamp).toISOString(),
      cpu: m.cpu,
      memory: m.memory,
      requestsPerMinute: m.rpm,
      errorRate: m.errorRate,
    }));
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

export const monitoringService = new MonitoringService();
