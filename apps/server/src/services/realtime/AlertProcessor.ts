import { PrismaClient, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';
import logger from '../../config/logger';
import { getIO } from '../../socket';

const prisma = new PrismaClient();

export interface AlertPayload {
  serialNumber: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp?: string;
}

export class AlertProcessor {
  public async process(payload: AlertPayload) {
    try {
      const meter = await prisma.meter.findUnique({
        where: { serialNumber: payload.serialNumber },
        select: { id: true, consumerId: true }
      });

      if (!meter) {
        logger.warn(`[AlertProcessor] Unknown meter for alert: ${payload.serialNumber}`);
        return;
      }

      const alert = await prisma.alert.create({
        data: {
          meterId: meter.id,
          type: payload.type,
          severity: payload.severity,
          status: AlertStatus.NEW,
          title: payload.title,
          description: payload.description,
          createdAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        }
      });

      const broadcastData = {
        ...alert,
        serialNumber: payload.serialNumber,
        consumerId: meter.consumerId,
      };

      // Send to Alerts Namespace (Utility/Admin)
      getIO().of('/alerts').emit('alert:new', broadcastData);
      
      // Send to Consumer Namespace if it affects them directly
      getIO().of('/consumer').to(`consumer:${meter.consumerId}`).emit('alert:new', broadcastData);

      // Update Admin/Utility live dash
      getIO().of('/dashboard').emit('dashboard:update', { type: 'alert', data: broadcastData });

    } catch (error: any) {
      logger.error(`[AlertProcessor] Error processing alert: ${error.message}`);
    }
  }
}

export const alertProcessor = new AlertProcessor();
