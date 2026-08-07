import prisma from '../../config/database';
import { CreateIncidentDTO, UpdateIncidentDTO, CreateIncidentCommentDTO, GetIncidentsQuery } from './incidents.types';
import { Prisma } from '@prisma/client';

export class IncidentsRepository {
  async createIncident(creatorId: string, data: CreateIncidentDTO) {
    return prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        alertId: data.alertId,
        assigneeId: data.assigneeId,
        creatorId
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        alert: true
      }
    });
  }

  async getIncidents(query: GetIncidentsQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.IncidentWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.assigneeId && { assigneeId: query.assigneeId }),
      ...(query.creatorId && { creatorId: query.creatorId }),
      deletedAt: null
    };

    const [total, data] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } }
        }
      })
    ]);

    return { data, total, page, limit };
  }

  async getIncidentById(id: string) {
    return prisma.incident.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        alert: true,
        comments: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async updateIncident(id: string, data: UpdateIncidentDTO) {
    const updateData: Prisma.IncidentUpdateInput = {
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.assigneeId && { assigneeId: data.assigneeId })
    };

    if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();
    if (data.status === 'CLOSED') updateData.closedAt = new Date();

    return prisma.incident.update({
      where: { id },
      data: updateData
    });
  }

  async addComment(incidentId: string, userId: string, data: CreateIncidentCommentDTO) {
    return prisma.incidentComment.create({
      data: {
        incidentId,
        userId,
        content: data.content
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });
  }
}

export const incidentsRepository = new IncidentsRepository();
