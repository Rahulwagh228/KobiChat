/**
 * Socket Event Handlers
 * Functions to handle incoming socket events from server
 */

import { Socket } from 'socket.io-client';
import { Message, UserStatusChange, TypingIndicator } from './types';

/**
 * Setup all socket event listeners
 * This function should be called after socket is initialized
 * 
 * Events explained:
 * 1. 'message:receive' - When a new message arrives from someone
 * 2. 'user:online' - When another user comes online
 * 3. 'user:offline' - When another user goes offline
 * 4. 'user:typing' - When another user is typing
 * 5. 'error' - When server sends an error
 * 
 * @param socket - Socket instance
 * @param handlers - Object containing callback functions for each event
 */
export const setupSocketListeners = (
  socket: Socket,
  handlers: {
    onMessageReceive?: (message: Message) => void;
    onUserOnline?: (user: UserStatusChange) => void;
    onUserOffline?: (user: UserStatusChange) => void;
    onTyping?: (data: TypingIndicator) => void;
    onError?: (error: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
) => {
  // Listen for incoming messages
  socket.on('message:receive', (message: Message) => {
    console.log('📨 Message received:', message);
    handlers.onMessageReceive?.(message);
  });

  // Listen for user online status
  socket.on('user:online', (user: UserStatusChange) => {
    console.log('✅ User online:', user.username);
    handlers.onUserOnline?.(user);
  });

  // Listen for user offline status
  socket.on('user:offline', (user: UserStatusChange) => {
    console.log('❌ User offline:', user.username);
    handlers.onUserOffline?.(user);
  });

  // Listen for typing indicator
  socket.on('user:typing', (data: TypingIndicator) => {
    console.log('✏️ User typing:', data);
    handlers.onTyping?.(data);
  });

  // Listen for errors
  socket.on('error', (error: any) => {
    console.error('⚠️ Socket error event:', error);
    handlers.onError?.(error);
  });

  // Listen for connection
  socket.on('connect', () => {
    console.log('🔗 Connected to socket server');
    handlers.onConnect?.();
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('🔓 Disconnected from socket server');
    handlers.onDisconnect?.();
  });
};

/**
 * Remove all socket event listeners
 * Should be called when component unmounts
 * 
 * @param socket - Socket instance
 */
export const removeSocketListeners = (socket: Socket) => {
  socket.off('message:receive');
  socket.off('user:online');
  socket.off('user:offline');
  socket.off('user:typing');
  socket.off('error');
  socket.off('connect');
  socket.off('disconnect');
};
