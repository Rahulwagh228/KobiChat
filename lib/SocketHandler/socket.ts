/**
 * Socket Configuration and Initialization
 * Handles Socket.IO connection setup and configuration
 */

import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket Connection
 * This should be called once when the app loads or user authenticates
 * 
 * How it works:
 * 1. Checks if socket already exists (prevents multiple connections)
 * 2. Creates new Socket.IO client connection to server
 * 3. Sets up automatic reconnection with exponential backoff
 * 4. Enables transport fallbacks (websocket, polling, etc)
 * 
 * @param token - JWT token for authentication
 * @returns Socket instance
 */
export const initializeSocket = (token: string): Socket => {
  // If socket already exists and is connected, return it
  if (socket?.connected) {
    console.log('✅ Socket already connected');
    return socket;
  }

  // Create new socket connection
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    // Authentication: Send token with connection request
    // Server uses this to verify the user
    auth: {
      token: token,
    },
    
    // Reconnection settings
    reconnection: true,           
    reconnectionDelay: 1000,      
    reconnectionDelayMax: 5000,   
    reconnectionAttempts: 5,      
    
    transports: ['websocket', 'polling'],
    
    // Query parameters sent to server
    query: {
      token: token,
    },
  });

  // Log connection state
  socket.on('connect', () => {
    console.log('🎉 Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️ Socket connection error:', error);
  });

  return socket;
};

/**
 * Get existing socket instance
 * Returns the current socket or initializes if needed
 * 
 * @returns Socket instance or null
 */
export const getSocket = (): Socket | null => {
  return socket;
};


export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected and cleaned up');
  }
};

/**
 * Check if socket is connected
 * 
 * @returns true if socket is connected, false otherwise
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

export default socket;
