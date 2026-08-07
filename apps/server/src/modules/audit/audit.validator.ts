import { z } from 'zod';

export const getAuditLogsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
