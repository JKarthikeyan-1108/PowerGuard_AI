import { AppError } from '../../middleware/errorHandler';
import { consumersRepository } from './consumers.repository';
import { GetConsumersQuery } from './consumers.types';
import { Prisma } from '@prisma/client';

export class ConsumersService {
  async getConsumers(query: GetConsumersQuery) {
    const { page = '1', limit = '20', search } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Prisma.ConsumerProfileWhereInput = {};
    if (search) {
      where.OR = [
        { accountNumber: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [consumers, total] = await Promise.all([
      consumersRepository.findConsumers(where, skip, take),
      consumersRepository.countConsumers(where),
    ]);

    return {
      consumers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / take) },
    };
  }

  async getConsumerById(id: string, requestUser: { id: string; role: string }) {
    const consumer = await consumersRepository.findConsumerById(id);
    if (!consumer) throw new AppError('Consumer profile not found', 404);

    if (requestUser.role === 'CONSUMER' && consumer.userId !== requestUser.id) {
      throw new AppError('Access denied', 403);
    }
    return consumer;
  }
  
  async updateConsumer(id: string, data: any, requestUser: { id: string; role: string }) {
    const consumer = await consumersRepository.findConsumerById(id);
    if (!consumer) throw new AppError('Consumer not found', 404);

    if (requestUser.role === 'CONSUMER' && consumer.userId !== requestUser.id) {
      throw new AppError('Access denied', 403);
    }

    return consumersRepository.updateConsumer(id, data);
  }

  async deleteConsumer(id: string, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN') {
      throw new AppError('Access denied', 403);
    }
    await consumersRepository.deleteConsumer(id);
  }

  async getConsumerDashboard(id: string, requestUser: { id: string; role: string }) {
    const consumer = await consumersRepository.findConsumerById(id);
    if (!consumer) throw new AppError('Consumer not found', 404);

    if (requestUser.role === 'CONSUMER' && consumer.userId !== requestUser.id) {
      throw new AppError('Access denied', 403);
    }

    return consumersRepository.getConsumerDashboard(id);
  }
}

export const consumersService = new ConsumersService();
