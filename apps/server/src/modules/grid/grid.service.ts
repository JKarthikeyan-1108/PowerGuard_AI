import prisma from '../../config/database';
import logger from '../../config/logger';

export interface GraphNode {
  id: string;
  type: 'area' | 'transformer' | 'meter';
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export class GridService {
  public async getTopology(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    try {
      // 1. Fetch Areas
      const areas = await prisma.area.findMany({
        select: { id: true, name: true, riskLevel: true, totalMeters: true },
      });

      // 2. Fetch Transformers
      const transformers = await prisma.transformer.findMany({
        select: { id: true, name: true, areaId: true, status: true, loadPercent: true, capacity: true },
      });

      // 3. Fetch Meters
      const meters = await prisma.meter.findMany({
        where: { deletedAt: null },
        select: { id: true, serialNumber: true, transformerId: true, status: true, type: true, consumerId: true },
      });

      // Create Area Nodes
      areas.forEach((area) => {
        nodes.push({
          id: `area_${area.id}`,
          type: 'area',
          data: { label: area.name, riskLevel: area.riskLevel, meterCount: area.totalMeters },
          position: { x: 0, y: 0 },
        });
      });

      // Create Transformer Nodes & Edges to Areas
      transformers.forEach((trans) => {
        nodes.push({
          id: `trans_${trans.id}`,
          type: 'transformer',
          data: { label: trans.name, status: trans.status, loadPercent: trans.loadPercent, capacity: trans.capacity },
          position: { x: 0, y: 0 },
        });

        if (trans.areaId) {
          edges.push({
            id: `e_area_${trans.areaId}_trans_${trans.id}`,
            source: `area_${trans.areaId}`,
            target: `trans_${trans.id}`,
            type: 'default',
          });
        }
      });

      // Create Meter Nodes & Edges to Transformers
      meters.forEach((meter) => {
        nodes.push({
          id: `meter_${meter.id}`,
          type: 'meter',
          data: { 
            label: meter.serialNumber, 
            status: meter.status, 
            type: meter.type,
            consumerId: meter.consumerId 
          },
          position: { x: 0, y: 0 },
        });

        if (meter.transformerId) {
          edges.push({
            id: `e_trans_${meter.transformerId}_meter_${meter.id}`,
            source: `trans_${meter.transformerId}`,
            target: `meter_${meter.id}`,
            type: 'powerEdge', // Custom animated edge type in frontend
            animated: meter.status === 'ACTIVE',
          });
        }
      });

      return { nodes, edges };
    } catch (error: any) {
      logger.error(`[GridService] Error fetching topology: ${error.message}`);
      throw new Error('Failed to fetch grid topology');
    }
  }
}

export const gridService = new GridService();
