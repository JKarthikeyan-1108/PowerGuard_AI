import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../config/logger';

let io: Server;

// Middleware for authentication
const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
    (socket as any).user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const namespaces = ['/dashboard', '/consumer', '/utility', '/admin', '/alerts', '/readings'];

  namespaces.forEach((ns) => {
    const namespace = io.of(ns);
    
    // Apply Auth middleware to all namespaces
    namespace.use(authenticateSocket);

    namespace.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      logger.info(`⚡ Socket connected to ${ns}: ${user.email} (${user.role})`);

      // Enforce role-based access for specific namespaces
      if (ns === '/admin' && user.role !== 'ADMIN') {
        socket.disconnect();
        return;
      }
      if (ns === '/utility' && user.role !== 'UTILITY_OFFICER' && user.role !== 'ADMIN') {
        socket.disconnect();
        return;
      }

      // Consumer gets a personal room for targeted alerts/readings
      if (ns === '/consumer') {
        socket.join(`consumer:${user.id}`);
      }

      // Subscribe to specific meters if in readings namespace
      if (ns === '/readings') {
        socket.on('subscribe:meter', (meterId: string) => {
          socket.join(`meter:${meterId}`);
        });
        socket.on('unsubscribe:meter', (meterId: string) => {
          socket.leave(`meter:${meterId}`);
        });
      }

      socket.on('disconnect', (reason) => {
        logger.info(`🔌 Socket disconnected from ${ns}: ${user.email} - ${reason}`);
      });

      socket.on('error', (err) => {
        logger.error(`❌ Socket error on ${ns} for ${user.email}:`, err);
      });
    });
  });

  logger.info('✅ Socket.IO Namespaces initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
