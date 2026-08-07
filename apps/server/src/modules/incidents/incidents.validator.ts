import { z } from 'zod';
import { IncidentStatus, IncidentPriority } from '@prisma/client';

export const createIncidentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.nativeEnum(IncidentPriority).optional(),
  alertId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const updateIncidentSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  assigneeId: z.string().uuid().optional(),
});

export const createIncidentCommentSchema = z.object({
  content: z.string().min(1),
});

export const getIncidentsSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});
