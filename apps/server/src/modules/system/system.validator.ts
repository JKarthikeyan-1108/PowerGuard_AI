import { z } from 'zod';

export const getSystemLogsSchema = z.object({
  level: z.string().optional(),
  service: z.string().optional(),
});
