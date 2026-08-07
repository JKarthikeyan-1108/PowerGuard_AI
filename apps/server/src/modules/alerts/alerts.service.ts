import { alertsRepository } from './alerts.repository';
import { GetAlertsQuery, UpdateAlertStatusDto, CreateAlertDto } from './alerts.types';
import { Prisma } from '@prisma/client';

export class AlertsService {
  async getAlerts(query: GetAlertsQuery, requestUser: { id: string; role: string }) {
    const { status, severity, type } = query;
    
    const where: Prisma.AlertWhereInput = {};
    if (status) where.status = status as any;
    if (severity) where.severity = severity as any;
    if (type) where.type = type as any;

    if (requestUser.role === 'CONSUMER') {
      where.userId = requestUser.id;
    }

    return alertsRepository.findAlerts(where);
  }

  async createAlert(data: CreateAlertDto) {
    const alert = await alertsRepository.createAlert({
      ...data,
      type: data.type as any,
      severity: data.severity as any,
    });
    
    const { socketService } = require('../../services/socket.service');
    socketService.emitToRole('ADMIN', 'new_alert', alert);
    socketService.emitToRole('UTILITY_OFFICER', 'new_alert', alert);

    return alert;
  }

  async updateAlertStatus(id: string, data: UpdateAlertStatusDto, requestUser: { id: string }) {
    const { status } = data;
    
    const updateData: any = { status };
    if (status === 'RESOLVED' || status === 'FALSE_ALARM') {
      updateData.resolvedBy = requestUser.id;
      updateData.resolvedAt = new Date();
    }

    const alert = await alertsRepository.updateAlertStatus(id, updateData);

    await alertsRepository.logAudit(
      requestUser.id,
      'UPDATE_ALERT_STATUS',
      'alerts',
      alert.id,
      { newStatus: status }
    );

    return alert;
  }
}

export const alertsService = new AlertsService();
