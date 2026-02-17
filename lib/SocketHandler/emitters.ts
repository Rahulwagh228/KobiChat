/**
 * Socket Emit Functions
 * Functions to send events to the server via socket
 */

import { Socket } from 'socket.io-client';

/**
 * Authenticate socket with server
 * Must be called after socket connection is established
 * 
 * How it works:
 * 1. Client emits 'auth' event with JWT token to server
 * 2. Server verifies the token and gets user ID
 * 3. Server tracks online users and sets up socket rooms
 * 4. Client receives acknowledgment with success status
 * 
 * @param socket - Socket instance
 * @param token - JWT authentication token
 * @returns Promise that resolves when authenticated or rejects on error
 */
export const authenticateSocket = async (
  socket: Socket,
  token: string
): Promise<{ userId: string; success: boolean }> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error('Socket not connected'));
      return;
    }


    socket.emit('auth', { token }, (acknowledgment: any) => {
      if (acknowledgment?.success) {
        resolve({
          userId: acknowledgment.userId,
          success: true,
        });
      } else {
        console.error('❌ Socket authentication failed:', acknowledgment?.error);
        reject(new Error(acknowledgment?.error || 'Authentication failed'));
      }
    });
  });
};

/**
 * Send a message via socket
 * 
 * How it works:
 * 1. Client calls this function with message text
 * 2. Socket emits 'message:send' event to server with message data
 * 3. Server receives the message and broadcasts to recipients
 * 4. Both sender and recipient get the message
 * 
 * @param socket - Socket instance
 * @param messageText - The message content
 * @param recipientId - ID of the recipient (optional)
 * @param conversationId - ID of the conversation (optional)
 * @returns Promise that resolves when message is sent
 */
export const sendMessage = async (
  socket: Socket,
  messageText: string,
  recipientId?: string,
  conversationId?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error('Socket not connected'));
      return;
    }

    const messageData = {
      text: messageText,
      recipientId,
      conversationId,
      timestamp: new Date().toISOString(),
    };

    // console.log('📤 Sending message via socket:', messageData);


    // Emit message with callback to see if server received it
    socket.emit('message:send', messageData, (acknowledgment: any) => {
      if (acknowledgment?.success) {
        // console.log('✅ Message sent successfully');
        resolve();
      } else {
        console.error('❌ Message send failed:', acknowledgment?.error);
        reject(new Error(acknowledgment?.error || 'Failed to send message'));
      }
    });
  });
};

/**
 * Send typing indicator to other users
 * Lets them know you're currently typing
 * 
 * @param socket - Socket instance
 * @param isTyping - true if typing, false if stopped
 * @param conversationId - ID of the conversation
 */
export const sendTypingIndicator = (
  socket: Socket,
  isTyping: boolean,
  conversationId: string
): void => {
  if (!socket.connected) return;

  socket.emit('user:typing', {
    isTyping,
    conversationId,
  });

  // console.log(`✏️ Typing status: ${isTyping ? 'typing' : 'stopped'}`);
};

/**
 * Mark message as read
 * Tells the server you've read a message
 * 
 * @param socket - Socket instance
 * @param messageId - ID of the message you read
 */
export const markMessageAsRead = (socket: Socket, messageId: string): void => {
  if (!socket.connected) return;

  socket.emit('message:read', {
    messageId,
    readAt: new Date().toISOString(),
  });

  // console.log('✅ Message marked as read:', messageId);
};

/**
 * Join a conversation room
 * Subscribe to messages in a specific conversation
 * 
 * @param socket - Socket instance
 * @param conversationId - ID of the conversation to join
 */
export const joinConversation = (socket: Socket, conversationId: string): void => {
  if (!socket.connected) return;

  socket.emit('conversation:join', {
    conversationId,
  });

  // console.log('📍 Joined conversation:', conversationId);
};

/**
 * Leave a conversation room
 * Unsubscribe from messages in a conversation
 * 
 * @param socket - Socket instance
 * @param conversationId - ID of the conversation to leave
 */
export const leaveConversation = (socket: Socket, conversationId: string): void => {
  if (!socket.connected) return;

  socket.emit('conversation:leave', {
    conversationId,
  });

  // console.log('📍 Left conversation:', conversationId);
};

/**
 * Request conversation history
 * Load old messages from a conversation
 * 
 * @param socket - Socket instance
 * @param conversationId - ID of the conversation
 * @param page - Page number for pagination (optional)
 * @param limit - Number of messages per page (optional)
 */
export const requestConversationHistory = (
  socket: Socket,
  conversationId: string,
  page: number = 1,
  limit: number = 20
): void => {
  if (!socket.connected) return;

  socket.emit('conversation:history', {
    conversationId,
    page,
    limit,
  });

  // console.log('📜 Requesting conversation history:', conversationId);
};
