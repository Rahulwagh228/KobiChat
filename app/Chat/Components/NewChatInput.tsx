'use client';

import React, { useState } from 'react';
import { Conversation, CreateConversationPayload, getParticipantName } from '../types/conversation';

interface NewChatInputProps {
  onCreateChat: (participantEmail: string) => Promise<Conversation | null>;
  existingChats: Conversation[];
  isLoading?: boolean;
}

export default function NewChatInput({
  onCreateChat,
  existingChats,
  isLoading = false
}: NewChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    if (!inputValue.trim()) {
      setError('Please enter an email or username');
      return;
    }

    // Check if participant already exists in conversations
    const existingChat = existingChats.find(
      conv =>
        getParticipantName(conv).toLowerCase() === inputValue.toLowerCase()
    );

    if (existingChat) {
      setError('Chat already exists. Opening...');
      // Let parent handle the redirect
      await onCreateChat(inputValue);
      setInputValue('');
      setError('');
      return;
    }

    // Create new chat
    setIsCreating(true);
    setError('');

    try {
      const result = await onCreateChat(inputValue);
      if (result) {
        setInputValue('');
      }
    } catch (err) {
      setError('Failed to create chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  return (
    <div className="new-chat-input-wrapper">
      <div className={`new-chat-input-container ${isInputFocused ? 'focused' : ''}`}>
        <input
          type="text"
          placeholder="Enter email or username to start a chat..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyPress={handleKeyPress}
          className="new-chat-input"
          disabled={isLoading || isCreating}
        />
        <button
          onClick={handleCreateChat}
          disabled={isLoading || isCreating}
          className="new-chat-btn"
          title="Start a new chat"
        >
          {isCreating ? (
            <span className="btn-loader"></span>
          ) : (
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="btn-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="new-chat-error">{error}</p>}
    </div>
  );
}
