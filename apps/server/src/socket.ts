import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from './config';
import logger from './config/logger';

let io: SocketIOServer;

export const initSocketIO = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    jwt.verify(token, config.jwt.secret, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error: Invalid token'));
      
      // Attach user info to socket
      (socket as any).user = decoded;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${user?.email})`);

    // Clients can join specific rooms, e.g., 'room:alerts' or 'room:meters:123'
    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  logger.info('🚀 Socket.IO Gateway initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};
