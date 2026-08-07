import { z } from 'zod';

export const getTransformersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
  areaId: z.string().optional(),
});

export const createTransformerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  capacity: z.number().positive('Capacity must be positive'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
  areaId: z.string().min(1, 'Area ID is required'),
});
