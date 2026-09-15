import { Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AuthRequest } from './authenticate';

// Extend Express Request interface to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      apiScopes?: string[];
    }
  }
}

/**
 * Middleware to enforce Logical Tenant Isolation
 * Extracts the organizationId and sets it on the request context
 */
export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Priority 1: From authenticated user JWT (if already attached by auth middleware)
    if (req.user && (req.user as any).organizationId) {
      req.tenantId = (req.user as any).organizationId;
      return next();
    }
    
    // Priority 2: From custom header (useful for API keys or service-to-service calls)
    const orgHeader = req.headers['x-organization-id'];
    if (orgHeader && typeof orgHeader === 'string') {
      req.tenantId = orgHeader;
      return next();
    }
    
    // If no tenant context is found and it's required for this route, fail closed.
    res.status(403).json({
      success: false,
      error: 'Missing tenant context. x-organization-id header or valid user organization required.'
    });
  } catch (error) {
    logger.error('Error in tenant middleware', error);
    res.status(500).json({ success: false, error: 'Internal Server Error enforcing tenant isolation' });
  }
};

/**
 * Optional tenant middleware - attaches tenantId if present but doesn't block if missing
 * Useful for Super Admin routes that manage across tenants
 */
export const optionalTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user as any).organizationId) {
    req.tenantId = (req.user as any).organizationId;
  } else if (req.headers['x-organization-id'] && typeof req.headers['x-organization-id'] === 'string') {
    req.tenantId = req.headers['x-organization-id'];
  }
  next();
};
