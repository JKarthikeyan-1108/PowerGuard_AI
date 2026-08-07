import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { CreateTransformerDto } from './transformers.types';

export class TransformersRepository {
  async findTransformers(where: Prisma.TransformerWhereInput, skip: number, take: number) {
    return prisma.transformer.findMany({
      where,
      skip,
      take,
      include: {
        area: { select: { name: true, code: true } },
        _count: { select: { meters: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async countTransformers(where: Prisma.TransformerWhereInput) {
    return prisma.transformer.count({ where });
  }

  async findTransformerById(id: string) {
    return prisma.transformer.findUnique({
      where: { id },
      include: {
        area: true,
        meters: {
          include: {
            consumer: { select: { accountNumber: true, user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
  }

  async createTransformer(data: CreateTransformerDto) {
    return prisma.transformer.create({ data });
  }

  async logAudit(userId: string, action: string, resource: string, resourceId: string, details?: any) {
    return prisma.auditLog.create({
      data: { userId, action, resource, resourceId, details }
    });
  }
}

export const transformersRepository = new TransformersRepository();
