// Conversation types for chat interface
export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isActive?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface CreateConversationPayload {
  participantEmail?: string;
  participantId?: string;
}

export interface ConversationResponse {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
}
