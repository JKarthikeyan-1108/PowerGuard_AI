import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import crypto from 'crypto';
import logger from '../config/logger';

// Extends Request to include apiScope
declare global {
  namespace Express {
    interface Request {
      apiScopes?: string[];
    }
  }
}

/**
 * Middleware to authenticate API requests using an x-api-key header.
 * Ideal for SCADA, GIS, or ERP systems pushing data to PowerGuard.
 */
export const requireApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawKey = req.headers['x-api-key'] as string;
    
    if (!rawKey) {
      res.status(401).json({ success: false, error: 'Missing x-api-key header' });
      return;
    }

    // Hash the incoming key to compare with the stored hash
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: hashedKey }
    });

    if (!apiKeyRecord) {
      res.status(401).json({ success: false, error: 'Invalid API Key' });
      return;
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: 'API Key has expired' });
      return;
    }

    // Bind Tenant and Scopes to Request Context
    req.tenantId = apiKeyRecord.organizationId;
    req.apiScopes = (apiKeyRecord.scopes as string[]) || [];

    // Update last used asynchronously
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch(err => logger.error('Failed to update API key lastUsedAt', err));

    next();
  } catch (error) {
    logger.error('Error validating API Key', error);
    res.status(500).json({ success: false, error: 'Internal server error validating API Key' });
  }
};
