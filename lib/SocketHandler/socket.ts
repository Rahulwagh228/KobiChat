/**
 * Socket Configuration and Initialization
 * Singleton Pattern - Ensures only ONE socket connection for the entire app
 * Multiple components can share the same socket instance safely
 */

import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;
let isInitializing = false;
let initPromise: Promise<Socket> | null = null;

/**
 * Initialize Socket Connection (Singleton Pattern)
 * 
 * Ensures:
 * 1. Only ONE socket connection is created
 * 2. Multiple calls wait for the first initialization
 * 3. Already connected sockets are reused
 * 4. Automatic reconnection with exponential backoff
 * 
 * @param token - JWT token for authentication
 * @returns Promise resolving to Socket instance
 */
export const initializeSocket = async (token: string): Promise<Socket> => {
  // If socket already connected, reuse it
  if (socket?.connected) {
    // console.log('✅ Socket already connected, reusing instance');
    return socket;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initPromise) {
    // console.log('⏳ Socket initialization in progress, waiting...');
    return initPromise;
  }

  // If socket exists but disconnected, clean it up and recreate
  if (socket && !socket.connected) {
    // console.log('🔄 Socket disconnected, cleaning up for reconnection...');
    socket.disconnect();
    socket = null;
    isInitializing = false;
    initPromise = null;
  }

  // Start initialization
  isInitializing = true;

  initPromise = new Promise((resolve, reject) => {
    try {
      // Create socket if it doesn't exist
      if (!socket) {
        // console.log('🔧 Creating new socket connection...');
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
          auth: {
            token: token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          query: {
            token: token,
          },
        });

        let authTimeout: NodeJS.Timeout | null = null;

        // Setup connection handlers ONCE
        socket.on('connect', () => {
          // console.log('🎉 Socket connected:', socket?.id);

          // Set timeout for auth response (5 seconds)
          authTimeout = setTimeout(() => {
            console.warn('⚠️ Auth response timeout, proceeding anyway');
            if (isInitializing) {
              isInitializing = false;
              initPromise = null;
              resolve(socket!);
            }
          }, 5000);

          // Authenticate immediately after connection
          socket!.emit('auth', { token }, (acknowledgment: any) => {
            if (authTimeout) clearTimeout(authTimeout);
            
            if (acknowledgment?.success) {
              // console.log('✅ Socket authenticated, User ID:', acknowledgment?.userId);
              if (isInitializing) {
                isInitializing = false;
                initPromise = null;
                resolve(socket!);
              }
            } else {
              console.error('❌ Socket authentication failed:', acknowledgment?.error);
              if (isInitializing) {
                isInitializing = false;
                initPromise = null;
                reject(new Error(acknowledgment?.error || 'Authentication failed'));
              }
            }
          });
        });

        socket.on('disconnect', () => {
          // console.log('❌ Socket disconnected');
        });

        socket.on('connect_error', (error) => {
          console.error('⚠️ Socket connection error:', error);
          if (isInitializing) {
            isInitializing = false;
            initPromise = null;
            reject(error);
          }
        });

        socket.on('auth-error', (error: any) => {
          console.error('🔐 Authentication error:', error?.message);
          if (isInitializing) {
            isInitializing = false;
            initPromise = null;
            reject(new Error(error?.message || 'Authentication error'));
          }
        });
      }
    } catch (error) {
      isInitializing = false;
      initPromise = null;
      reject(error);
    }
  });

  return initPromise;
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
    isInitializing = false;
    initPromise = null;
    // console.log('🔌 Socket disconnected and cleaned up');
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
