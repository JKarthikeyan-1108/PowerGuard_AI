import prisma from '../../config/database';
import logger from '../../config/logger';

export class SaasService {
  /**
   * Fetch all organizations with their plans
   */
  public async getOrganizations() {
    return prisma.organization.findMany({
      include: {
        plan: true,
        _count: {
          select: { users: true, meters: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create a new organization and default super admin
   */
  public async createOrganization(data: any) {
    // Demo implementation for creating a new tenant
    return prisma.organization.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: data.type || 'COMPANY',
        subscriptionPlanId: data.planId,
        status: 'ACTIVE'
      },
      include: { plan: true }
    });
  }

  /**
   * Get all subscription plans available
   */
  public async getSubscriptionPlans() {
    let plans = await prisma.subscriptionPlan.findMany();
    
    // Seed default plans if none exist for demo
    if (plans.length === 0) {
      await prisma.subscriptionPlan.createMany({
        data: [
          {
            name: 'Basic Edition',
            priceMonthly: 499,
            maxMeters: 500,
            maxUsers: 10,
            features: JSON.stringify(['dashboard', 'billing'])
          },
          {
            name: 'Pro Edition',
            priceMonthly: 1299,
            maxMeters: 5000,
            maxUsers: 50,
            features: JSON.stringify(['dashboard', 'billing', 'advanced_ai', 'theft_detection'])
          },
          {
            name: 'Enterprise Board',
            priceMonthly: 4999,
            maxMeters: 50000,
            maxUsers: 200,
            features: JSON.stringify(['dashboard', 'billing', 'advanced_ai', 'theft_detection', 'digital_twin', 'predictive_maintenance'])
          }
        ]
      });
      plans = await prisma.subscriptionPlan.findMany();
    }
    
    return plans;
  }
}

export const saasService = new SaasService();
