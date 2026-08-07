import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './users.types';

export class UsersRepository {
  async findUsers(where: Prisma.UserWhereInput, skip: number, take: number) {
    return prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, roles: true, status: true, avatar: true,
        lastLoginAt: true, createdAt: true,
        consumerProfile: { select: { accountNumber: true, connectionType: true } },
        utilityOfficer: { select: { employeeId: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUsers(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, roles: true, status: true, avatar: true, emailVerified: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
        consumerProfile: { include: { area: true, meters: true } },
        utilityOfficer: true,
      },
    });
  }

  async updateUser(id: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, roles: true, status: true },
    });
  }

  async logAudit(userId: string, action: string, resource: string, resourceId: string, details?: any) {
    return prisma.auditLog.create({
      data: { userId, action, resource, resourceId, details },
    });
  }
}

export const usersRepository = new UsersRepository();
