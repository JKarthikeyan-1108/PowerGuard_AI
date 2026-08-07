import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { getMQTTClient } from '../../services/mqtt.service';
import logger from '../../config/logger';

export class DevicesService {
  
  async restartDevice(meterId: string) {
    const meter = await this.getMeterByUUID(meterId);
    
    const mqttClient = getMQTTClient();
    const payload = JSON.stringify({ meterId: meter.serialNumber, command: 'RESTART', timestamp: new Date() });
    mqttClient.publish('devices/restart', payload, { qos: 1 });
    
    logger.info(`Restart command sent to meter ${meter.serialNumber}`);
  }

  async syncConfig(meterId: string, data: any) {
    const meter = await this.getMeterByUUID(meterId);
    
    const config = await prisma.deviceConfig.upsert({
      where: { meterId: meter.id },
      update: {
        pollingRateMs: data.pollingRateMs,
        heartbeatRateMs: data.heartbeatRateMs,
        autoReconnect: data.autoReconnect,
        lastSyncAt: new Date()
      },
      create: {
        meterId: meter.id,
        pollingRateMs: data.pollingRateMs || 5000,
        heartbeatRateMs: data.heartbeatRateMs || 30000,
        autoReconnect: data.autoReconnect ?? true,
        lastSyncAt: new Date()
      }
    });

    const mqttClient = getMQTTClient();
    const payload = JSON.stringify({ 
      meterId: meter.serialNumber, 
      config: {
        pollingRateMs: config.pollingRateMs,
        heartbeatRateMs: config.heartbeatRateMs,
        autoReconnect: config.autoReconnect
      },
      timestamp: new Date() 
    });
    mqttClient.publish('devices/config', payload, { qos: 1 });

    return config;
  }

  async updateFirmware(meterId: string, firmwareUrl: string, version: string) {
    const meter = await this.getMeterByUUID(meterId);
    
    const mqttClient = getMQTTClient();
    const payload = JSON.stringify({ 
      meterId: meter.serialNumber, 
      firmwareUrl,
      version,
      timestamp: new Date() 
    });
    mqttClient.publish('devices/update', payload, { qos: 1 });
  }

  async getDeviceLogs(meterId: string) {
    const meter = await this.getMeterByUUID(meterId);
    
    const [heartbeats, connections] = await Promise.all([
      prisma.heartbeatLog.findMany({
        where: { meterId: meter.id },
        orderBy: { timestamp: 'desc' },
        take: 50
      }),
      prisma.connectionLog.findMany({
        where: { meterId: meter.id },
        orderBy: { timestamp: 'desc' },
        take: 50
      })
    ]);

    return { heartbeats, connections };
  }

  async getDeviceConfig(meterId: string) {
    const meter = await this.getMeterByUUID(meterId);
    const config = await prisma.deviceConfig.findUnique({
      where: { meterId: meter.id }
    });
    return config || null;
  }

  private async getMeterByUUID(id: string) {
    const meter = await prisma.meter.findUnique({ where: { id } });
    if (!meter) {
      throw new AppError('Meter not found', 404);
    }
    return meter;
  }
}

export const devicesService = new DevicesService();
