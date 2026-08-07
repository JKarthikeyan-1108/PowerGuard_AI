import { getIO } from '../socket';

export const socketService = {
  emitToRole(role: string, event: string, data: any) {
    try {
      const io = getIO();
      // In a real app we'd track users by role and emit, or have a room per role.
      // Assuming clients joined room:role_{ROLE}
      io.to(`role_${role}`).emit(event, data);
    } catch (e) {
      console.warn('Socket not initialized or failed to emit', e);
    }
  },
  
  emitToUser(userId: string, event: string, data: any) {
    try {
      const io = getIO();
      // Assuming clients joined room:user_{USERID}
      io.to(`user_${userId}`).emit(event, data);
    } catch (e) {
      console.warn('Socket not initialized or failed to emit', e);
    }
  },

  emitToAll(event: string, data: any) {
    try {
      const io = getIO();
      io.emit(event, data);
    } catch (e) {
      console.warn('Socket not initialized or failed to emit', e);
    }
  }
};
