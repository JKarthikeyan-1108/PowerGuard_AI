import { AppError } from '../../middleware/errorHandler';
import { metersRepository } from './meters.repository';
import { GetMetersQuery, GetReadingsQuery } from './meters.types';
import { Prisma } from '@prisma/client';
import { UpdateMeterStatusDto } from './meters.validator';

export class MetersService {
  async getMeters(query: GetMetersQuery) {
    const { page = '1', limit = '50', status, type, search } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Prisma.MeterWhereInput = {};
    if (status) where.status = status as any;
    if (type) where.type = type as any;
    if (search) {
      where.OR = [
        { serialNumber: { contains: search } },
      ];
    }

    const [meters, total] = await Promise.all([
      metersRepository.findMeters(where, skip, take),
      metersRepository.countMeters(where),
    ]);

    return {
      meters,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / take) },
    };
  }

  async getMeterReadings(id: string, query: GetReadingsQuery, requestUser: { id: string; role: string }) {
    const { days = '7' } = query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    const meter = await metersRepository.findMeterById(id);
    if (!meter) throw new AppError('Meter not found', 404);

    if (requestUser.role === 'CONSUMER' && meter.consumer?.userId !== requestUser.id) {
      throw new AppError('Access denied to this meter\'s readings', 403);
    }

    return metersRepository.findMeterReadings(id, dateLimit);
  }

  async updateMeterStatus(id: string, data: UpdateMeterStatusDto, requestUser: { id: string; role: string }) {
    const meter = await metersRepository.updateMeterStatus(id, data);
    
    await metersRepository.logAudit(
      requestUser.id,
      'UPDATE_METER_STATUS',
      'meters',
      meter.id,
      { newStatus: data.status }
    );

    return meter;
  }

  async createMeter(data: Prisma.MeterCreateInput, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN') throw new AppError('Access denied', 403);
    const meter = await metersRepository.createMeter(data);
    await metersRepository.logAudit(requestUser.id, 'CREATE_METER', 'meters', meter.id);
    return meter;
  }

  async assignMeter(id: string, consumerId: string, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN' && requestUser.role !== 'UTILITY_OFFICER') {
      throw new AppError('Access denied', 403);
    }
    const meter = await metersRepository.updateMeterConsumer(id, consumerId);
    await metersRepository.logAudit(requestUser.id, 'ASSIGN_METER', 'meters', meter.id, { consumerId });
    return meter;
  }

  async transferMeter(id: string, newConsumerId: string, requestUser: { id: string; role: string }) {
    if (requestUser.role !== 'ADMIN') throw new AppError('Access denied', 403);
    const meter = await metersRepository.updateMeterConsumer(id, newConsumerId);
    await metersRepository.logAudit(requestUser.id, 'TRANSFER_METER', 'meters', meter.id, { newConsumerId });
    return meter;
  }

  async getMeterById(id: string, requestUser: { id: string; role: string }) {
    const meter = await metersRepository.findMeterById(id);
    if (!meter) throw new AppError('Meter not found', 404);
    if (requestUser.role === 'CONSUMER' && meter.consumer?.userId !== requestUser.id) {
      throw new AppError('Access denied', 403);
    }
    return meter;
  }
}

export const metersService = new MetersService();
