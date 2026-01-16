import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io('http://localhost:5000', {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const joinCenter = (centerId: string) => {
  if (socket?.connected) {
    socket.emit('join:center', centerId);
    console.log(`Joined center room: ${centerId}`);
  }
};

export const leaveCenter = (centerId: string) => {
  if (socket?.connected) {
    socket.emit('leave:center', centerId);
    console.log(`Left center room: ${centerId}`);
  }
};

export const onContainerStatusUpdated = (
  callback: (data: {
    containerId: string;
    centerId: string;
    newState: 'empty' | 'full' | 'maintenance';
    updatedAt: string;
  }) => void
) => {
  if (socket) {
    socket.on('container.status.updated', callback);
  }
};

export const offContainerStatusUpdated = () => {
  if (socket) {
    socket.off('container.status.updated');
  }
};
