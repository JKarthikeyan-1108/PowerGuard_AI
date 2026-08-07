import { z } from 'zod';

export const downloadReportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv']).optional(),
  type: z.enum(['alerts', 'billing', 'theft', 'energy', 'revenue', 'loss', 'co2']).optional(),
});
