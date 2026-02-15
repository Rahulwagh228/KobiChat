'use client';

import React, { useEffect, useState } from 'react';
import { Conversation, getParticipantName } from '../types/conversation';

interface ChatListProps {
  conversations: Conversation[];
  selectedChatId: string | null;
  onChatSelect: (conversationId: string) => void;
  isLoading: boolean;
  onMobileClose?: () => void;
}

export default function ChatList({
  conversations,
  selectedChatId,
  onChatSelect,
  isLoading,
  onMobileClose
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Conversation[]>(conversations);

  useEffect(() => {
    // Filter conversations by participant name
    const filtered = conversations.filter(conv =>
      getParticipantName(conv).toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, conversations]);

  const handleChatClick = (conversationId: string) => {
    onChatSelect(conversationId);
    onMobileClose?.();
  };

  return (
    <div className="chat-list-container">
      {/* Search Bar */}
      <div className="chat-list-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {isLoading ? (
          <div className="chat-list-loading">
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>{searchQuery ? 'No chats found' : 'No chats yet. Start one!'}</p>
          </div>
        ) : (
          filteredChats.map((conversation) => {
            const participantName = getParticipantName(conversation);
            return (
            <div
              key={conversation._id}
              className={`chat-item ${selectedChatId === conversation._id ? 'active' : ''}`}
              onClick={() => handleChatClick(conversation._id)}
            >
              {/* Avatar */}
              <div className="chat-item-avatar">
                {conversation.participants[0]?.avatar ? (
                  <img 
                    src={conversation.participants[0].avatar} 
                    alt={participantName}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {participantName?.charAt(0).toUpperCase()}
                  </div>
                )}
                {conversation.unreadCount ? (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                ) : null}
              </div>

              {/* Chat Info */}
              <div className="chat-item-content">
                <div className="chat-item-header">
                  <h3 className="chat-item-name">{participantName}</h3>
                  <span className="chat-item-time">{conversation.lastMessageTime}</span>
                </div>
                <p className="chat-item-message">
                  {conversation.lastMessage || 'No messages yet'}
                </p>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
