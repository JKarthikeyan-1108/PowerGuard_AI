import { z } from 'zod';

export const getAlertsSchema = z.object({
  status: z.enum(['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_ALARM']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum(['THEFT_SUSPECTED', 'VOLTAGE_DROP', 'TRANSFORMER_OVERLOAD', 'METER_TAMPERED', 'OFFLINE']).optional(),
});

export const updateAlertStatusSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_ALARM']),
});

export const createAlertSchema = z.object({
  type: z.string(),
  severity: z.string(),
  title: z.string().min(1),
  description: z.string(),
  meterId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.any().optional(),
});
