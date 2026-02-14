import { Conversation, Message, CreateConversationPayload, ConversationResponse } from '@/app/Chat/types/conversation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.124.204.189:5000/api';

// Get all conversations for the current user
export const getUserConversations = async (token: string): Promise<Conversation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('Kobi');
        window.location.href = '/auth';
      }
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    // Map API response to Conversation interface
    return data.conversations || data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (
  conversationId: string,
  token: string
): Promise<Message[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages || data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (
  payload: CreateConversationPayload,
  token: string
): Promise<Conversation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create conversation');
    }

    const data = await response.json();
    return data.conversation || data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Get all people the user has conversations with (for autocomplete)
export const getAllConversationPeople = async (token: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/people/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch people');
    }

    const data = await response.json();
    return data.people || data || [];
  } catch (error) {
    console.error('Error fetching people:', error);
    throw error;
  }
};
