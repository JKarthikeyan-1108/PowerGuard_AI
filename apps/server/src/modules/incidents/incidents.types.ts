import { IncidentStatus, IncidentPriority } from '@prisma/client';

export interface CreateIncidentDTO {
  title: string;
  description: string;
  priority?: IncidentPriority;
  alertId?: string;
  assigneeId?: string;
}

export interface UpdateIncidentDTO {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  assigneeId?: string;
}

export interface CreateIncidentCommentDTO {
  content: string;
}

export interface GetIncidentsQuery {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  assigneeId?: string;
  creatorId?: string;
  page?: string;
  limit?: string;
}
