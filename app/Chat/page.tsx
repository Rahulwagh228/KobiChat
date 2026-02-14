'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatList from './Components/ChatList';
import ChatArea from './Components/ChatArea';
import NewChatInput from './Components/NewChatInput';
import { Conversation } from './types/conversation';
import { getUserConversations, createConversation } from '@/lib/chatService';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const router = useRouter();
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

  // Check authentication and load conversations
  useEffect(() => {
    const checkAuth = async () => {
      let authToken: string | null = null;
      try {
        const kobiData = localStorage.getItem('Kobi');
        authToken = kobiData ? JSON.parse(kobiData).token : null;
      } catch (error) {
        console.error('Error parsing Kobi auth:', error);
      }
      
      if (!authToken) {
        router.push('/auth');
        return;
      }

      setIsAuthenticated(true);

      try {
        const chats = await getUserConversations(authToken);
        setConversations(chats);
        
        // Auto-select first conversation if exists
        if (chats.length > 0) {
          setSelectedConversation(chats[0]);
          setShowMobileList(false);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateChat = async (participantEmail: string): Promise<Conversation | null> => {
    if (!token) return null;

    try {
      // Check if conversation already exists
      const existingChat = conversations.find(
        conv =>
          conv.participantEmail.toLowerCase() === participantEmail.toLowerCase() ||
          conv.participantName.toLowerCase() === participantEmail.toLowerCase()
      );

      if (existingChat) {
        setSelectedConversation(existingChat);
        setShowMobileList(false);
        return existingChat;
      }

      // Create new conversation
      const newConversation = await createConversation(
        { ParticipantEmailOrName: participantEmail },
        token
      );

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setShowMobileList(false);
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Kobi');
    router.push('/auth');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a'
      }}>
        <div style={{ fontSize: '16px', color: '#808080' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="whatsapp-container">
      {/* Sidebar */}
      <div className={`sidebar-section ${showMobileList ? 'mobile-visible' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h1>Messages</h1>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* New Chat Input */}
        <NewChatInput 
          onCreateChat={handleCreateChat}
          existingChats={conversations}
          isLoading={isLoading}
        />

        {/* Chat List */}
        <ChatList
          conversations={conversations}
          selectedChatId={selectedConversation?.id || null}
          onChatSelect={(id) => {
            const chat = conversations.find(c => c.id === id);
            setSelectedConversation(chat || null);
            setShowMobileList(false);
          }}
          isLoading={isLoading}
          onMobileClose={() => setShowMobileList(false)}
        />
      </div>

      {/* Chat Area */}
      <div className={`chat-section ${!showMobileList ? 'mobile-visible' : ''}`}>
        <ChatArea 
          selectedConversation={selectedConversation}
          onBackClick={() => setShowMobileList(true)}
        />
      </div>
    </div>
  );
}

