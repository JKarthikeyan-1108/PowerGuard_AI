import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import prisma from '../config/database';
import logger from '../config/logger';
import { ACCESS_TOKEN_COOKIE } from './cookieAuth';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Priority 0: Device API key authentication for IoT hardware/simulators
    const apiKey = (req.headers['x-api-key'] || req.headers['x-device-key']) as string | undefined;
    const validApiKey = process.env.IOT_DEVICE_API_KEY || 'powerguard-iot-secret-2026';
    if (apiKey && (apiKey === validApiKey || apiKey === 'pg-sim-key-2026' || apiKey === 'esp32-pzem004t-key-auth')) {
      req.user = {
        id: 'system-iot-device',
        email: 'device@powerguard.internal',
        role: 'UTILITY_OFFICER',
        firstName: 'IoT',
        lastName: 'Device',
      };
      next();
      return;
    }

    let token: string | undefined;

    // Priority 1: Read access token from HttpOnly cookie
    if (req.cookies?.[ACCESS_TOKEN_COOKIE]) {
      token = req.cookies[ACCESS_TOKEN_COOKIE];
    }

    // Priority 2: Fall back to Authorization header (for API clients, mobile apps, etc.)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, roles: true, firstName: true, lastName: true, status: true, organizationId: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ success: false, error: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email ?? '',
      role: user.roles[0]?.name || 'CONSUMER',
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId ?? undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    logger.error('Authentication error', { error });
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};
