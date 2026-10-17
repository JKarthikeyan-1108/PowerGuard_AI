import { ReadingSource, MeterStatus, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { getIO } from '../../socket';
import { aiService } from '../ai.service';

export interface ReadingPayload {
  serialNumber: string;
  value: number;
  voltage?: number;
  current?: number;
  powerFactor?: number;
  frequency?: number;
  timestamp?: string;
}

export class ReadingProcessor {
  // Simple buffer for batch inserts if we wanted to batch. 
  // For immediate real-time, we will do single inserts but wrapped efficiently.
  
  public async process(payload: ReadingPayload) {
    try {
      const meter = await prisma.meter.findUnique({
        where: { serialNumber: payload.serialNumber },
        select: { id: true, consumerId: true, type: true, latitude: true, longitude: true }
      });

      if (!meter) {
        logger.warn(`[ReadingProcessor] Unknown meter: ${payload.serialNumber}`);
        return;
      }

      // Data Validation: exclude invalid readings before storage
      if (
        (payload.voltage !== undefined && (payload.voltage < 0 || payload.voltage > 500)) ||
        (payload.current !== undefined && (payload.current < 0 || payload.current > 200)) ||
        (payload.frequency !== undefined && (payload.frequency < 30 || payload.frequency > 70)) ||
        (payload.value < 0)
      ) {
        logger.warn(`[ReadingProcessor] Invalid reading dropped for meter ${payload.serialNumber}: ${JSON.stringify(payload)}`);
        return;
      }

      // Update meter to ONLINE if it wasn't
      await prisma.meter.update({
        where: { id: meter.id },
        data: { status: MeterStatus.ACTIVE }
      });

      // Insert Reading
      const reading = await prisma.meterReading.create({
        data: {
          meterId: meter.id,
          value: payload.value,
          voltage: payload.voltage,
          current: payload.current,
          powerFactor: payload.powerFactor,
          frequency: payload.frequency,
          timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          source: ReadingSource.SMART_METER,
          isAnomaly: false, // Update below if theft is detected
        }
      });

      // AI ENGINE: Theft Detection
      // Assuming defaults for missing payload data to hit AI engine
      const aiResult = await aiService.predictTheft(
        payload.serialNumber, 
        payload.voltage || 230, 
        payload.current || 10, 
        payload.powerFactor || 0.95, 
        payload.frequency || 50, 
        payload.value
      );

      if (aiResult) {
        const isAnomaly = ['HIGH', 'CRITICAL', 'Suspicious', 'High Risk'].includes(aiResult.risk_level) || 
                          ['Meter Tampering', 'Electricity Theft'].includes(aiResult.explanation);

        // Save theft prediction to DB
        await prisma.theftPrediction.create({
          data: {
            meterId: meter.id,
            probability: aiResult.probability || aiResult.confidence,
            riskLevel: aiResult.risk_level,
            modelVersion: 'v1.0',
            features: aiResult.feature_importance,
            verified: false
          }
        });

        if (isAnomaly) {
          await prisma.meterReading.update({
            where: { id: reading.id },
            data: { isAnomaly: true }
          });
          
          const alertSeverity = aiResult.risk_level === 'High Risk' ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
          const alertTitle = aiResult.risk_level === 'High Risk' ? 'Critical Consumption Anomaly' : 'Suspicious Load Pattern';
          const alertDesc = `Meter ${payload.serialNumber} shows ${aiResult.risk_level} risk. ${aiResult.explanation || ''} Confidence: ${((aiResult.confidence || 0.9) * 100).toFixed(1)}%`;

          const savedAlert = await prisma.alert.create({
            data: {
              meterId: meter.id,
              type: AlertType.THEFT_DETECTED,
              severity: alertSeverity,
              status: AlertStatus.NEW,
              title: alertTitle,
              description: alertDesc,
            }
          });

          // Emit alert
          getIO().of('/alerts').emit('alert:new', {
            id: savedAlert.id,
            title: alertTitle,
            description: alertDesc,
            severity: alertSeverity,
            status: savedAlert.status,
            meterId: meter.id,
            serialNumber: payload.serialNumber,
            consumerId: meter.consumerId,
            createdAt: savedAlert.createdAt,
          });

          if (meter.consumerId) {
            getIO().of('/consumer').to(`consumer:${meter.consumerId}`).emit('alert:new', {
              id: savedAlert.id,
              title: alertTitle,
              description: alertDesc,
              severity: alertSeverity,
              createdAt: savedAlert.createdAt,
            });
          }
        }
      }

      const broadcastData = {
        ...reading,
        serialNumber: payload.serialNumber,
        consumerId: meter.consumerId,
        latitude: meter.latitude,
        longitude: meter.longitude,
      };

      // Broadcast to /readings namespace for global charts
      getIO().of('/readings').emit('meter:new-reading', broadcastData);

      // Broadcast to /consumer namespace for specific consumer UI
      getIO().of('/consumer').to(`consumer:${meter.consumerId}`).emit('meter:new-reading', broadcastData);
      
      // Update specific dashboard
      getIO().of('/dashboard').emit('dashboard:update', { type: 'reading', data: broadcastData });

    } catch (error: any) {
      logger.error(`[ReadingProcessor] Error processing reading: ${error.message}`);
    }
  }
}

export const readingProcessor = new ReadingProcessor();
