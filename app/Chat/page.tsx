'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import ChatArea from './Components/ChatArea';
import FloatingHearts from './Components/FloatingHearts';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #ffeef8 0%, #ffe6f0 50%, #ffcce5 100%)'
      }}>
        <div style={{ fontSize: '16px', color: '#ff1493' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="chat-page-container">
      {/* Floating Hearts Background */}
      <div className="floating-hearts-container">
        <FloatingHearts />
      </div>

      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Chat Content */}
      <ChatArea />
    </div>
  );
}
