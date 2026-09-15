import { io, Socket } from 'socket.io-client';

const sockets: Record<string, Socket> = {};

export const connectSocket = (namespace: string = '/'): Socket => {
  if (sockets[namespace]?.connected) return sockets[namespace];

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
  const url = `${wsUrl}${namespace === '/' ? '' : namespace}`;

  const socket = io(url, {
    // HttpOnly cookies are sent automatically with withCredentials
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log(`⚡ Socket connected to ${namespace}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected from ${namespace}:`, reason);
  });

  socket.on('connect_error', (error) => {
    console.error(`Socket connection error on ${namespace}:`, error.message);
  });

  sockets[namespace] = socket;
  return socket;
};

export const disconnectSocket = (namespace: string = '/') => {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    delete sockets[namespace];
  }
};

export const getSocket = (namespace: string = '/'): Socket | null => sockets[namespace] || null;
