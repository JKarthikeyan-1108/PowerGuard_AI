import { AppError } from '../../middleware/errorHandler';
import { transformersRepository } from './transformers.repository';
import { GetTransformersQuery, CreateTransformerDto } from './transformers.types';
import { Prisma } from '@prisma/client';

export class TransformersService {
  async getTransformers(query: GetTransformersQuery) {
    const { page = '1', limit = '20', status, areaId } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Prisma.TransformerWhereInput = {};
    if (status) where.status = status as any;
    if (areaId) where.areaId = areaId;

    const [transformers, total] = await Promise.all([
      transformersRepository.findTransformers(where, skip, take),
      transformersRepository.countTransformers(where),
    ]);

    return {
      transformers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / take) },
    };
  }

  async getTransformerById(id: string) {
    const transformer = await transformersRepository.findTransformerById(id);
    if (!transformer) throw new AppError('Transformer not found', 404);
    return transformer;
  }

  async createTransformer(data: CreateTransformerDto, requestUser: { id: string }) {
    const transformer = await transformersRepository.createTransformer(data);
    
    await transformersRepository.logAudit(
      requestUser.id,
      'CREATE_TRANSFORMER',
      'transformers',
      transformer.id
    );

    return transformer;
  }
}

export const transformersService = new TransformersService();
