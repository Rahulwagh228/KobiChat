'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/SocketHandler';
import { Message as SocketMessage } from '@/lib/SocketHandler/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  senderId?: string;
  senderName?: string;
}

export default function ChatArea() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! How are you doing today? 💕",
      sender: 'other',
      timestamp: '10:30 AM',
      senderName: 'Other User'
    },
    {
      id: '2',
      text: "I'm doing great! Missing you though ❤️",
      sender: 'user',
      timestamp: '10:32 AM',
      senderName: 'You'
    },
    {
      id: '3',
      text: "Can't wait to see you again soon 😊",
      sender: 'other',
      timestamp: '10:33 AM',
      senderName: 'Other User'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Initialize socket connection
  const { socket, isConnected, isLoading, sendMessage } = useSocket(token, {
    onMessageReceive: (receivedMessage: SocketMessage) => {
      console.log('📨 New message received:', receivedMessage);
      
      // Add received message to chat
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
    },
    onError: (error) => {
      console.error('Socket error:', error);
      alert('Connection error. Please refresh the page.');
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      // Send message via socket
      await sendMessage(messageText);

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
  if (isLoading) {
    return (
      <div className="chat-area">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#ff69b4' }}>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-indicator"></span>
        <span className="status-text">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
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
          placeholder="Say something sweet... 💕"
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
