import { z } from 'zod';

export const getMetersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FAULTY', 'TAMPERED', 'MAINTENANCE']).optional(),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']).optional(),
  search: z.string().optional(),
});

export const getReadingsSchema = z.object({
  days: z.string().optional(),
});

export const updateMeterStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'FAULTY', 'TAMPERED', 'MAINTENANCE']),
});

export type UpdateMeterStatusDto = z.infer<typeof updateMeterStatusSchema>;
