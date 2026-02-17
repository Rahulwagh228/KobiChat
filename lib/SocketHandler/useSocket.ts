/**
 * Use Socket Hook - React hook for socket communication
 * 
 * BEST PRACTICES:
 * 1. Only ONE socket connection shared by all components
 * 2. Components subscribe/unsubscribe on mount/unmount
 * 3. Callbacks are memoized to prevent unnecessary updates
 * 4. Proper dependency tracking to avoid infinite loops
 */

'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from './socket';
import { subscribeToSocket, removeSocketListeners } from './handlers';
import {
  sendMessage,
  sendTypingIndicator,
  joinConversation,
  leaveConversation,
} from './emitters';
import { Message, UserStatusChange, TypingIndicator } from './types';

interface UseSocketOptions {
  onMessageReceive?: (message: Message) => void;
  onUserOnline?: (user: UserStatusChange) => void;
  onUserOffline?: (user: UserStatusChange) => void;
  onTyping?: (data: TypingIndicator) => void;
  onOnlineUsers?: (users: string[]) => void;
  onAuthError?: (error: any) => void;
  onError?: (error: any) => void;
}

let hookInstanceCount = 0;

export function useSocket(token: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hookIdRef = useRef<string>('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Generate unique ID for this hook instance
  useEffect(() => {
    hookInstanceCount++;
    hookIdRef.current = `useSocket-${hookInstanceCount}-${Date.now()}`;
  }, []);

  // Memoize options to prevent unnecessary re-renders
  // Only recreate if any handler actually changes
  const memoizedOptions = useMemo(
    () => ({
      onMessageReceive: options.onMessageReceive,
      onUserOnline: options.onUserOnline,
      onUserOffline: options.onUserOffline,
      onTyping: options.onTyping,
      onOnlineUsers: options.onOnlineUsers,
      onAuthError: options.onAuthError,
      onError: options.onError,
    }),
    [
      options.onMessageReceive,
      options.onUserOnline,
      options.onUserOffline,
      options.onTyping,
      options.onOnlineUsers,
      options.onAuthError,
      options.onError,
    ]
  );

  // Initialize socket connection ONCE per token
  useEffect(() => {
    if (!token) {
      // console.log('⚠️ No token available, cannot initialize socket');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initSocket = async () => {
      try {
        // console.log(`🚀 useSocket initializing for ${hookIdRef.current}`);

        // Initialize socket (singleton - only creates once)
        const initializedSocket = await initializeSocket(token);
        
        if (!isMounted) return;

        socketRef.current = initializedSocket;
        setIsConnected(initializedSocket.connected);

        // Subscribe to socket events
        unsubscribeRef.current = subscribeToSocket(
          initializedSocket,
          hookIdRef.current,
          {
            onMessageReceive: memoizedOptions.onMessageReceive,
            onUserOnline: memoizedOptions.onUserOnline,
            onUserOffline: memoizedOptions.onUserOffline,
            onTyping: memoizedOptions.onTyping,
            onOnlineUsers: memoizedOptions.onOnlineUsers,
            onAuthError: memoizedOptions.onAuthError,
            onError: memoizedOptions.onError,
          }
        );

        // Setup connection state listeners
        const handleConnect = () => {
          if (isMounted) setIsConnected(true);
        };
        const handleDisconnect = () => {
          if (isMounted) setIsConnected(false);
        };

        initializedSocket.on('connect', handleConnect);
        initializedSocket.on('disconnect', handleDisconnect);

        setIsLoading(false);

        return () => {
          initializedSocket.off('connect', handleConnect);
          initializedSocket.off('disconnect', handleDisconnect);
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [token, memoizedOptions]);

  // Memoize message sending to prevent function recreation
  const handleSendMessage = useCallback(
    async (messageText: string, recipientId?: string, conversationId?: string) => {
      if (!socketRef.current?.connected) {
        throw new Error('Socket not connected');
      }
      return sendMessage(socketRef.current, messageText, recipientId, conversationId);
    },
    []
  );

  // Memoize typing indicator
  const handleTyping = useCallback((isTyping: boolean, conversationId: string) => {
    if (socketRef.current?.connected) {
      sendTypingIndicator(socketRef.current, isTyping, conversationId);
    }
  }, []);

  // Memoize join conversation
  const handleJoinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      joinConversation(socketRef.current, conversationId);
    }
  }, []);

  // Memoize leave conversation
  const handleLeaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      leaveConversation(socketRef.current, conversationId);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isLoading,
    sendMessage: handleSendMessage,
    sendTypingIndicator: handleTyping,
    joinConversation: handleJoinConversation,
    leaveConversation: handleLeaveConversation,
  };
}
