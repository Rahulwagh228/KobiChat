/**
 * Socket Types and Interfaces
 * Defines all type definitions for socket messages and events
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  conversationId?: string;
  readAt?: string;
}

export interface SocketUser {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Conversation {
  id: string;
  participants: SocketUser[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  text: string;
  recipientId?: string;
  conversationId?: string;
}

export interface ReceiveMessageData extends Message {
  senderName: string;
}

export interface UserStatusChange {
  userId: string;
  isOnline: boolean;
  username: string;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  conversationId: string;
}

export interface SocketError {
  code: string;
  message: string;
}
