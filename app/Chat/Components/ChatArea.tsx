'use client';

import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey! How are you doing today? 💕",
      sender: 'other',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      text: "I'm doing great! Missing you though ❤️",
      sender: 'user',
      timestamp: '10:32 AM'
    },
    {
      id: 3,
      text: "Can't wait to see you again soon 😊",
      sender: 'other',
      timestamp: '10:33 AM'
    }
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-area">
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
      </div>

      {/* Input Area */}
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Say something sweet... 💕"
          className="message-input"
          rows={1}
        />
        <button 
          onClick={handleSend}
          className="send-btn"
          aria-label="Send message"
        >
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
        </button>
      </div>
    </div>
  );
}
