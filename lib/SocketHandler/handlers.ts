/**
 * Socket Event Handlers
 * Centralized subscriber system for managing socket event listeners
 * Multiple components can subscribe without duplicating listeners
 */

import { Socket } from 'socket.io-client';
import { Message, UserStatusChange, TypingIndicator } from './types';

// Subscriber registry - tracks all active subscribers
interface SocketSubscriber {
  id: string;
  onMessageReceive?: (message: Message) => void;
  onUserOnline?: (user: UserStatusChange) => void;
  onUserOffline?: (user: UserStatusChange) => void;
  onTyping?: (data: TypingIndicator) => void;
  onOnlineUsers?: (users: string[]) => void;
  onAuthError?: (error: any) => void;
  onError?: (error: any) => void;
}

const subscribers = new Map<string, SocketSubscriber>();
let listenersSetup = false;

/**
 * Subscribe to socket events
 * Multiple subscribers can listen to the same events
 * 
 * @param subscriberId - Unique ID for this subscriber (e.g., component name)
 * @param handlers - Event handlers for this subscriber
 * @returns Function to unsubscribe
 */
export const subscribeToSocket = (
  socket: Socket,
  subscriberId: string,
  handlers: {
    onMessageReceive?: (message: Message) => void;
    onUserOnline?: (user: UserStatusChange) => void;
    onUserOffline?: (user: UserStatusChange) => void;
    onTyping?: (data: TypingIndicator) => void;
    onOnlineUsers?: (users: string[]) => void;
    onAuthError?: (error: any) => void;
    onError?: (error: any) => void;
  }
) => {
  // Register this subscriber
  subscribers.set(subscriberId, { id: subscriberId, ...handlers });
  console.log(`📝 Subscriber registered: ${subscriberId} (total: ${subscribers.size})`);

  // Setup socket listeners ONCE - not per subscription
  if (!listenersSetup) {
    setupSocketListeners(socket);
    listenersSetup = true;
  }

  // Return unsubscribe function
  return () => {
    unsubscribeFromSocket(subscriberId);
  };
};

/**
 * Unsubscribe from socket events
 * 
 * @param subscriberId - ID of the subscriber to remove
 */
export const unsubscribeFromSocket = (subscriberId: string) => {
  const deleted = subscribers.delete(subscriberId);
  if (deleted) {
    console.log(`🗑️ Subscriber removed: ${subscriberId} (remaining: ${subscribers.size})`);
  }

  // Keep listeners active as long as there are subscribers
  // Only remove listeners when ALL subscribers are gone
};

/**
 * Setup socket listeners (called ONCE)
 * All subscribers receive notifications through their registered handlers
 * 
 * @param socket - Socket instance
 */
const setupSocketListeners = (socket: Socket) => {
  console.log('🔌 Setting up socket listeners (global, once)...');

  // Listen for incoming messages
  socket.on('message:receive', (message: Message) => {
    console.log('📨 Message received:', message.text.substring(0, 50));
    subscribers.forEach((subscriber) => {
      subscriber.onMessageReceive?.(message);
    });
  });

  // Listen for user online status
  socket.on('user:online', (user: UserStatusChange) => {
    console.log('✅ User online:', user.username);
    subscribers.forEach((subscriber) => {
      subscriber.onUserOnline?.(user);
    });
  });

  // Listen for user offline status
  socket.on('user:offline', (user: UserStatusChange) => {
    console.log('❌ User offline:', user.username);
    subscribers.forEach((subscriber) => {
      subscriber.onUserOffline?.(user);
    });
  });

  // Listen for typing indicator
  socket.on('user:typing', (data: TypingIndicator) => {
    console.log('✏️ User typing:', data.userId);
    subscribers.forEach((subscriber) => {
      subscriber.onTyping?.(data);
    });
  });

  // Listen for online users list
  socket.on('online-users', (onlineUserIds: string[]) => {
    console.log('👥 Online users updated:', onlineUserIds.length, 'users');
    subscribers.forEach((subscriber) => {
      subscriber.onOnlineUsers?.(onlineUserIds);
    });
  });

  // Listen for authentication errors
  socket.on('auth-error', (error: any) => {
    console.error('🔐 Authentication error:', error?.message);
    subscribers.forEach((subscriber) => {
      subscriber.onAuthError?.(error);
    });
  });

  // Listen for general errors
  socket.on('error', (error: any) => {
    console.error('⚠️ Socket error event:', error);
    subscribers.forEach((subscriber) => {
      subscriber.onError?.(error);
    });
  });
};

/**
 * Remove all socket event listeners
 * Should only be called when disconnecting
 * 
 * @param socket - Socket instance
 */
export const removeSocketListeners = (socket: Socket) => {
  console.log('🔌 Removing all socket listeners');
  socket.off('message:receive');
  socket.off('user:online');
  socket.off('user:offline');
  socket.off('user:typing');
  socket.off('online-users');
  socket.off('auth-error');
  socket.off('error');
  listenersSetup = false;
  subscribers.clear();
};

