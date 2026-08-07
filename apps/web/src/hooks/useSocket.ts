import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useSocket(namespace = '') {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.warn('Socket connection aborted: No authentication token found.');
      return;
    }

    const socket = io(`${SOCKET_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 Socket.IO Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket.IO Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO Connection Error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [namespace]);

  const joinRoom = (room: string) => {
    socketRef.current?.emit('join_room', room);
  };

  const leaveRoom = (room: string) => {
    socketRef.current?.emit('leave_room', room);
  };

  return { socket: socketRef.current, isConnected, joinRoom, leaveRoom };
}
