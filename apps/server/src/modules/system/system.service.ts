import os from 'os';
import { systemRepository } from './system.repository';
import { GetSystemLogsQuery } from './system.types';
import { Prisma } from '@prisma/client';

export class SystemService {
  async getHealthMetrics() {
    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1 minute load average

    return {
      services: {
        api: { status: 'Operational', uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m` },
        database: { status: 'Operational', latency: '12ms' }, // Mocking DB latency
        aiEngine: { status: 'Operational', latency: '45ms' }, // Mocking AI Engine
        mqttBroker: { status: 'Operational', connections: 450 } // Mocking MQTT
      },
      metrics: {
        cpuUsage: Math.min((cpuLoad / os.cpus().length) * 100, 100).toFixed(2),
        memoryUsage: ((usedMem / totalMem) * 100).toFixed(2),
        activeConnections: Math.floor(Math.random() * 500) + 100 // Mocking active WS connections
      }
    };
  }

  async getLogs(query: GetSystemLogsQuery) {
    const { level, service } = query;
    
    const where: Prisma.SystemLogWhereInput = {};
    if (level) where.level = level;
    if (service) where.service = service;

    return systemRepository.findSystemLogs(where);
  }

  async getGlobalSettings() {
    return systemRepository.findGlobalSettings();
  }
}

export const systemService = new SystemService();
