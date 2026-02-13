/**
 * Use Socket Hook
 * React hook for managing socket connection and communication
 * 
 * This hook handles:
 * - Socket initialization
 * - Socket event listening
 * - Sending messages
 * - Cleanup on unmount
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from './socket';
import { setupSocketListeners, removeSocketListeners } from './handlers';
import { sendMessage, sendTypingIndicator, joinConversation, leaveConversation } from './emitters';
import { Message, UserStatusChange, TypingIndicator } from './types';

interface UseSocketOptions {
  onMessageReceive?: (message: Message) => void;
  onUserOnline?: (user: UserStatusChange) => void;
  onUserOffline?: (user: UserStatusChange) => void;
  onTyping?: (data: TypingIndicator) => void;
  onError?: (error: any) => void;
}

export function useSocket(token: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    if (!token) {
      console.log('⚠️ No token available, cannot initialize socket');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize socket if not already done
      if (!socketRef.current?.connected) {
        socketRef.current = initializeSocket(token);
      }

      // Setup event listeners
      setupSocketListeners(socketRef.current, {
        onMessageReceive: options.onMessageReceive,
        onUserOnline: options.onUserOnline,
        onUserOffline: options.onUserOffline,
        onTyping: options.onTyping,
        onError: options.onError,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing socket:', error);
      setIsLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        removeSocketListeners(socketRef.current);
      }
    };
  }, [token, options]);

  // Send message via socket
  const handleSendMessage = useCallback(
    async (messageText: string, recipientId?: string, conversationId?: string) => {
      if (!socketRef.current?.connected) {
        throw new Error('Socket not connected');
      }
      return sendMessage(socketRef.current, messageText, recipientId, conversationId);
    },
    []
  );

  // Send typing indicator
  const handleTyping = useCallback((isTyping: boolean, conversationId: string) => {
    if (socketRef.current?.connected) {
      sendTypingIndicator(socketRef.current, isTyping, conversationId);
    }
  }, []);

  // Join conversation
  const handleJoinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      joinConversation(socketRef.current, conversationId);
    }
  }, []);

  // Leave conversation
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
