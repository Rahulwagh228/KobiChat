'use client';

import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const menuItems = [
    { icon: '💬', label: 'Messages', href: '#' },
    { icon: '❤️', label: 'Favorites', href: '#' },
    { icon: '👥', label: 'Contacts', href: '#' },
    { icon: '⚙️', label: 'Settings', href: '#' },
    { icon: '📞', label: 'Support', href: '#' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Bono</h2>
          <button 
            onClick={onClose}
            className="close-btn"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="sidebar-item"
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <p className="user-name">You</p>
              <p className="user-status">Active now</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}
