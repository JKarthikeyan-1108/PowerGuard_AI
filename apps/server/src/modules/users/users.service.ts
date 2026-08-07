import { AppError } from '../../middleware/errorHandler';
import { usersRepository } from './users.repository';
import { GetUsersQuery, UpdateUserDto } from './users.types';
import { Prisma } from '@prisma/client';
import { cacheService } from '../../utils/cache';

export class UsersService {
  async getUsers(query: GetUsersQuery) {
    const { page = '1', limit = '20', role, status, search } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Prisma.UserWhereInput = {};
    if (role) where.roles = { some: { name: role as string } };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      usersRepository.findUsers(where, skip, take),
      usersRepository.countUsers(where),
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      },
    };
  }

  async getUserById(id: string, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN' && requestUser.id !== id) {
      throw new AppError('Access denied', 403);
    }
    
    const cacheKey = `user:${id}`;
    let user = cacheService.get<any>(cacheKey);

    if (!user) {
      user = await usersRepository.findUserById(id);
      if (!user) throw new AppError('User not found', 404);
      cacheService.set(cacheKey, user, 60000); // cache for 1 minute
    }
    
    return user;
  }

  async updateUser(id: string, data: UpdateUserDto, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN' && requestUser.id !== id) {
      throw new AppError('Access denied', 403);
    }
    
    // Only admin can change status
    if (data.status && requestUser.role !== 'ADMIN') {
      throw new AppError('Only admins can change user status', 403);
    }

    const updatedUser = await usersRepository.updateUser(id, data);
    
    // Audit log
    await usersRepository.logAudit(
      requestUser.id, 
      'UPDATE_USER', 
      'users', 
      id, 
      data
    );

    // Invalidate cache
    cacheService.delete(`user:${id}`);

    return updatedUser;
  }

  async deleteUser(id: string, requestUser: { id: string; role: string }) {
    // Soft delete (suspend/inactive)
    await usersRepository.updateUser(id, { status: 'INACTIVE' });
    
    await usersRepository.logAudit(
      requestUser.id, 
      'DEACTIVATE_USER', 
      'users', 
      id
    );
  }

  async changeUserStatus(id: string, status: string, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN') {
      throw new AppError('Only admins can change user status', 403);
    }
    
    await usersRepository.updateUser(id, { status: status as any });
    
    await usersRepository.logAudit(
      requestUser.id, 
      'CHANGE_STATUS', 
      'users', 
      id,
      { status }
    );
  }
}

export const usersService = new UsersService();
