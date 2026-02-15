// Conversation types for chat interface
export interface Participant {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Helper to get participant details
export const getParticipantName = (conversation: Conversation): string => {
  return conversation.participants[0]?.username || 'Unknown';
};

export const getParticipantId = (conversation: Conversation): string => {
  return conversation.participants[0]?._id || '';
};

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface CreateConversationPayload {
  ParticipantEmailOrName?: string;
}

export interface ConversationResponse {
  _id: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
}
