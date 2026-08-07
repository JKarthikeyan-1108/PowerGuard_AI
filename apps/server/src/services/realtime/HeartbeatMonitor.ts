import { PrismaClient, MeterStatus, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';
import logger from '../../config/logger';
import { getIO } from '../../socket';

const prisma = new PrismaClient();

export interface HeartbeatPayload {
  serialNumber: string;
  status: 'ONLINE' | 'OFFLINE';
  firmwareVersion?: string;
  uptime?: number;
  timestamp?: string;
}

export class HeartbeatMonitor {
  public async process(payload: HeartbeatPayload) {
    try {
      const meter = await prisma.meter.findUnique({
        where: { serialNumber: payload.serialNumber },
        select: { id: true, status: true, consumerId: true }
      });

      if (!meter) {
        logger.warn(`[HeartbeatMonitor] Unknown meter: ${payload.serialNumber}`);
        return;
      }

      await prisma.heartbeatLog.create({
        data: {
          meterId: meter.id,
          status: payload.status,
          firmwareVersion: payload.firmwareVersion,
          uptime: payload.uptime
        }
      });

      const newStatus = payload.status === 'ONLINE' ? MeterStatus.ACTIVE : MeterStatus.FAULTY;
      
      if (meter.status !== newStatus) {
        await prisma.meter.update({
          where: { id: meter.id },
          data: { 
            status: newStatus,
            ...(payload.firmwareVersion ? { firmwareVersion: payload.firmwareVersion } : {}) 
          }
        });

        await prisma.connectionLog.create({
          data: {
            meterId: meter.id,
            event: payload.status === 'ONLINE' ? 'CONNECT' : 'DISCONNECT',
            reason: payload.status === 'ONLINE' ? 'Heartbeat' : 'LWT or timeout'
          }
        });

        const eventName = payload.status === 'ONLINE' ? 'meter:online' : 'meter:offline';
        const broadcastData = { serialNumber: payload.serialNumber, status: newStatus, timestamp: new Date() };

        getIO().of('/readings').emit(eventName, broadcastData);
        getIO().of('/consumer').to(`consumer:${meter.consumerId}`).emit(eventName, broadcastData);
        getIO().of('/admin').emit('system:update', { type: 'meter_status_change', data: broadcastData });

        // If it just went offline unexpectedly, generate a critical alert
        if (payload.status === 'OFFLINE') {
          const alert = await prisma.alert.create({
            data: {
              meterId: meter.id,
              type: AlertType.ANOMALY_DETECTED,
              severity: AlertSeverity.CRITICAL,
              status: AlertStatus.NEW,
              title: 'Meter Offline',
              description: `Meter ${payload.serialNumber} missed heartbeats and went offline.`,
            }
          });
          getIO().of('/alerts').emit('alert:new', { ...alert, serialNumber: payload.serialNumber });
        }
      }

    } catch (error: any) {
      logger.error(`[HeartbeatMonitor] Error: ${error.message}`);
    }
  }
}

export const heartbeatMonitor = new HeartbeatMonitor();
