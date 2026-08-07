import { incidentsRepository } from './incidents.repository';
import { CreateIncidentDTO, UpdateIncidentDTO, CreateIncidentCommentDTO, GetIncidentsQuery } from './incidents.types';
import { AppError } from '../../middleware/errorHandler';
import { socketService } from '../../services/socket.service';

export class IncidentsService {
  async createIncident(creatorId: string, data: CreateIncidentDTO) {
    const incident = await incidentsRepository.createIncident(creatorId, data);
    
    // Broadcast via Socket
    socketService.emitToRole('ADMIN', 'new_incident', incident);
    socketService.emitToRole('UTILITY_OFFICER', 'new_incident', incident);
    
    return incident;
  }

  async getIncidents(query: GetIncidentsQuery) {
    return incidentsRepository.getIncidents(query);
  }

  async getIncidentById(id: string) {
    const incident = await incidentsRepository.getIncidentById(id);
    if (!incident) throw new AppError('Incident not found', 404);
    return incident;
  }

  async updateIncident(id: string, data: UpdateIncidentDTO) {
    // Verify exists
    await this.getIncidentById(id);
    const updated = await incidentsRepository.updateIncident(id, data);
    
    socketService.emitToRole('ADMIN', 'incident_updated', updated);
    socketService.emitToRole('UTILITY_OFFICER', 'incident_updated', updated);
    
    return updated;
  }

  async addComment(id: string, userId: string, data: CreateIncidentCommentDTO) {
    await this.getIncidentById(id);
    return incidentsRepository.addComment(id, userId, data);
  }
}

export const incidentsService = new IncidentsService();
