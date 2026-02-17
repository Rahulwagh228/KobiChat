'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/lib/SocketHandler';
import { Message as SocketMessage } from '@/lib/SocketHandler/types';
import { getConversationMessages } from '@/lib/chatService';
import { Conversation, Message as ChatMessage, getParticipantId } from '../types/conversation';

const getParticipantName = (conversation: Conversation): string => {
  return conversation.participants[0]?.username || 'Unknown User';
};

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
  const token = (() => {
    if (typeof window !== 'undefined') {
      try {
        const kobiData = localStorage.getItem('Kobi');
        return kobiData ? JSON.parse(kobiData).token : null;
      } catch {
        return null;
      }
    }
    return null;
  })();

  // Initialize socket connection with memoized callbacks
  const handleMessageReceive = useCallback(
    (receivedMessage: SocketMessage) => {
      console.log('📨 New message received:', receivedMessage);

      // Get current user ID
      const currentUserId = (() => {
        try {
          const kobiData = localStorage.getItem('Kobi');
          return kobiData ? JSON.parse(kobiData).user?._id : null;
        } catch {
          return null;
        }
      })();

      // Only add message if it's for the current conversation
      if (receivedMessage.conversationId === selectedConversation?._id) {
        const isCurrentUser = receivedMessage.senderId === currentUserId;
        
        const newMessage: Message = {
          id: receivedMessage.id,
          text: receivedMessage.text,
          sender: isCurrentUser ? 'user' : 'other',
          timestamp: new Date(receivedMessage.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          senderId: receivedMessage.senderId,
          senderName: receivedMessage.senderName,
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    },
    [selectedConversation?._id]
  );

  const handleSocketError = useCallback((error: any) => {
    console.error('Socket error:', error);
  }, []);

  const { socket, isConnected, isLoading, sendMessage, joinConversation: socketJoinConversation, leaveConversation: socketLeaveConversation } = useSocket(token, {
    onMessageReceive: handleMessageReceive,
    onError: handleSocketError,
  });

  // Join/Leave conversation when it changes
  useEffect(() => {
    if (!isConnected || !socket || !selectedConversation) {
      return;
    }

    console.log('👤 Joining conversation:', selectedConversation._id);
    socketJoinConversation(selectedConversation._id);

    // Cleanup: Leave conversation when unmounting or changing conversation
    return () => {
      if (selectedConversation) {
        console.log('👤 Leaving conversation:', selectedConversation._id);
        socketLeaveConversation(selectedConversation._id);
      }
    };
  }, [isConnected, socket, selectedConversation, socketJoinConversation, socketLeaveConversation]);

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
          selectedConversation._id,
          token
        );
        
        // Get current user ID from localStorage
        const currentUserId = (() => {
          try {
            const kobiData = localStorage.getItem('Kobi');
            return kobiData ? JSON.parse(kobiData).user?._id : null;
          } catch {
            return null;
          }
        })();
        
        console.log('Current User ID:', currentUserId);
        
        // Convert fetched messages to Message format
        const formattedMessages: Message[] = (fetchedMessages || []).map((msg: any) => {
          const senderId = msg.senderInfo?._id || msg.senderId;
          const isCurrentUser = senderId === currentUserId;
          
          return {
            id: msg._id,
            text: msg.content,
            sender: isCurrentUser ? 'user' : 'other',
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            senderId: senderId,
            senderName: msg.sender
          };
        });
        
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
    // console.log('Attempting to send message:', messageText);
    setInputValue('');
    setIsSending(true);

    try {
      // Send message via socket with conversation ID
      await sendMessage(messageText, getParticipantId(selectedConversation), selectedConversation._id);

      // Add message to local state immediately (optimistic update)
      const currentUserId = (() => {
        try {
          const kobiData = localStorage.getItem('Kobi');
          return kobiData ? JSON.parse(kobiData).user?.id : null;
        } catch {
          return null;
        }
      })();

      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        senderId: currentUserId || undefined,
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
          <h2 className="chat-header-name">{getParticipantName(selectedConversation)}</h2>
          <p className="chat-header-email">{selectedConversation.participants[0]?.email || 'No email'}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => {
          // Get current logged-in user ID from auth
          const currentUserId = (() => {
            try {
              const kobiData = localStorage.getItem('Kobi');
              return kobiData ? JSON.parse(kobiData).user?.id : null;
            } catch {
              return null;
            }
          })();

          // Check if this message is from the logged-in user
          const isCurrentUserMessage = message.senderId === currentUserId;
          console.log(isCurrentUserMessage, 'Is current user message:', message, currentUserId);

          return (
            <div
              key={message.id}
              className={`message-wrapper ${isCurrentUserMessage ? 'user' : 'other'}`}
            >
              <div className={`message-bubble message-${isCurrentUserMessage ? 'user' : 'other'}`}>
                <p className="message-text">{message.text}</p>
                <span className="message-time">{message.timestamp}</span>
              </div>
            </div>
          );
        })}
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
                viewBox="0 0 24 24"
                className="send-icon"
              >
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.99 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,3.16346272 C3.34915502,3.00636533 2.40734225,3.11683186 1.77946707,3.53519817 C0.994623095,4.13399899 0.837654326,5.27659502 1.15159189,6.0620819 L3.03521743,12.5052413 C3.03521743,12.6623387 3.19218622,12.8194361 3.50612381,12.8194361 L16.6915026,13.4170592 C16.6915026,13.4170592 17.1624089,13.4170592 17.1624089,12.9457671 L17.1624089,12.4744748 C17.1624089,12.0031827 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
