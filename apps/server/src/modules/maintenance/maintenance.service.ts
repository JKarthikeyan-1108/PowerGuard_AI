import prisma from '../../config/database';
import logger from '../../config/logger';

export class MaintenanceService {
  /**
   * Run the AI prediction logic for all transformers and generate AssetHealth.
   * In a real deployment, this would call the Python AI microservice.
   * Here, we simulate the prediction model logic based on age and load.
   */
  public async assessTransformerHealth(): Promise<{ processed: number }> {
    try {
      const transformers = await prisma.transformer.findMany();
      
      let processed = 0;
      for (const t of transformers) {
        // AI Model Simulation
        // 1. Base health is 100
        let healthScore = 100;
        
        // 2. Reduce health based on age (fake install dates for simulation)
        const ageInDays = Math.floor((Date.now() - t.installDate.getTime()) / (1000 * 60 * 60 * 24));
        healthScore -= (ageInDays / 365) * 2; // Lose 2% per year
        
        // 3. Reduce health based on current load
        if (t.loadPercent > 80) healthScore -= 10;
        if (t.loadPercent > 90) healthScore -= 20;

        healthScore = Math.max(0, Math.min(100, healthScore));

        // 4. Calculate Failure Probability (inverse of health, with some noise)
        const failureProbability = Math.min(1.0, ((100 - healthScore) / 100) + (Math.random() * 0.1));

        // 5. Remaining Useful Life (RUL in days)
        const maxLifeDays = 365 * 25; // 25 years
        const remainingUsefulLife = Math.max(0, Math.floor(maxLifeDays * (healthScore / 100)));

        // 6. Primary Risk Factor
        let primaryRiskFactor = 'Aging';
        if (t.loadPercent > 90) primaryRiskFactor = 'Transformer Overload';
        else if (t.status === 'FAULTY') primaryRiskFactor = 'Voltage Instability';
        else if (ageInDays < 365 * 5 && healthScore < 50) primaryRiskFactor = 'Manufacturing Defect';

        // Upsert the AssetHealth record
        await prisma.assetHealth.upsert({
          where: { transformerId: t.id },
          update: {
            healthScore,
            failureProbability,
            remainingUsefulLife,
            primaryRiskFactor,
            lastAssessedAt: new Date(),
          },
          create: {
            transformerId: t.id,
            healthScore,
            failureProbability,
            remainingUsefulLife,
            primaryRiskFactor,
          },
        });

        // Generate Maintenance Schedule if RUL < 30 days or Failure Probability > 0.85
        if (failureProbability > 0.85) {
          await this.recommendMaintenance(t.id, 'transformer');
        }

        processed++;
      }

      logger.info(`[MaintenanceService] Assessed health for ${processed} transformers.`);
      return { processed };
    } catch (error: any) {
      logger.error(`[MaintenanceService] Error in assessTransformerHealth: ${error.message}`);
      throw error;
    }
  }

  private async recommendMaintenance(assetId: string, assetType: 'transformer' | 'meter') {
    // Check if an open schedule already exists
    const existing = await prisma.maintenanceSchedule.findFirst({
      where: {
        ...(assetType === 'transformer' ? { transformerId: assetId } : { meterId: assetId }),
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    if (existing) return;

    // Create a new recommendation
    await prisma.maintenanceSchedule.create({
      data: {
        ...(assetType === 'transformer' ? { transformerId: assetId } : { meterId: assetId }),
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Recommend within 7 days
        taskDescription: 'AI Recommended: Urgent inspection required due to high failure probability.',
        status: 'SCHEDULED',
      },
    });
  }

  public async getDashboardData(): Promise<any> {
    const riskiestAssets = await prisma.assetHealth.findMany({
      include: {
        transformer: { select: { id: true, name: true, area: { select: { name: true } } } },
        meter: { select: { id: true, serialNumber: true } },
      },
      orderBy: { failureProbability: 'desc' },
      take: 10,
    });

    const upcomingSchedules = await prisma.maintenanceSchedule.findMany({
      include: {
        transformer: { select: { name: true } },
        meter: { select: { serialNumber: true } },
        technician: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      take: 20,
    });

    return { riskiestAssets, upcomingSchedules };
  }

  public async assignTechnician(scheduleId: string, technicianId: string): Promise<any> {
    return prisma.maintenanceSchedule.update({
      where: { id: scheduleId },
      data: { technicianId, status: 'IN_PROGRESS' },
    });
  }
}

export const maintenanceService = new MaintenanceService();
