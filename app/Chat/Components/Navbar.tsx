'use client';

import React from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="navbar-container">
      {/* Hamburger Menu */}
      <button 
        onClick={onMenuClick}
        className="hamburger-btn"
        aria-label="Toggle menu"
      >
        <svg
          className="hamburger-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Center Title */}
      <div className="navbar-title">
        <span className="title-text">Bono</span>
        <span className="title-heart">💕</span>
      </div>

      {/* Right Spacer */}
      <div className="navbar-spacer"></div>
    </nav>
  );
}
