'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/SocketHandler';
import { Message as SocketMessage } from '@/lib/SocketHandler/types';
import { getConversationMessages } from '@/lib/chatService';
import { Conversation, Message as ChatMessage } from '../types/conversation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  senderId?: string;
  senderName?: string;
}

interface ChatAreaProps {
  selectedConversation: Conversation | null;
  onBackClick?: () => void;
}

export default function ChatArea({ selectedConversation, onBackClick }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Initialize socket connection
  const { socket, isConnected, isLoading, sendMessage } = useSocket(token, {
    onMessageReceive: (receivedMessage: SocketMessage) => {
      console.log('📨 New message received:', receivedMessage);
      
      // Only add message if it's for the current conversation
      if (receivedMessage.conversationId === selectedConversation?.id) {
        const newMessage: Message = {
          id: receivedMessage.id,
          text: receivedMessage.text,
          sender: 'other',
          timestamp: new Date(receivedMessage.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          senderId: receivedMessage.senderId,
          senderName: receivedMessage.senderName
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    },
    onError: (error) => {
      console.error('Socket error:', error);
    }
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      if (!token) return;
      setIsLoadingMessages(true);
      try {
        const fetchedMessages = await getConversationMessages(
          selectedConversation.id,
          token
        );
        // Convert fetched messages to Message format
        const formattedMessages: Message[] = (fetchedMessages || []).map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.senderId === localStorage.getItem('userId') ? 'user' : 'other',
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          senderId: msg.senderId,
          senderName: msg.senderName
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversation, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected || isSending || !selectedConversation) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      // Send message via socket with conversation ID
      await sendMessage(messageText, selectedConversation.participantId, selectedConversation.id);

      // Add message to local state immediately (optimistic update)
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        senderName: 'You'
      };

      setMessages(prev => [...prev, newMessage]);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      // Restore input value if send failed
      setInputValue(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loading state while socket is initializing
  if (!selectedConversation) {
    return (
      <div className="chat-area empty-chat">
        <div className="empty-chat-content">
          <div className="empty-chat-icon">💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Choose a conversation from the list or start a new one</p>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingMessages) {
    return (
      <div className="chat-area">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#a0a0a0' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Chat Header */}
      <div className="chat-header">
        {onBackClick && (
          <button className="back-button" onClick={onBackClick} aria-label="Back to chats">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <div className="chat-header-info">
          <h2 className="chat-header-name">{selectedConversation.participantName}</h2>
          <p className="chat-header-email">{selectedConversation.participantEmail}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-wrapper ${message.sender}`}
          >
            <div className={`message-bubble message-${message.sender}`}>
              <p className="message-text">{message.text}</p>
              <span className="message-time">{message.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed to Bottom */}
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
          rows={1}
          disabled={!isConnected || isSending}
        />
        {/* Send button only shows when there's text */}
        {inputValue.trim() && (
          <button 
            onClick={handleSend}
            className="send-btn"
            aria-label="Send message"
            disabled={!isConnected || isSending}
            title={isSending ? 'Sending...' : 'Send message'}
          >
            {isSending ? (
              <div className="send-loader"></div>
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className="send-icon"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 5l8 5-8 5"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
