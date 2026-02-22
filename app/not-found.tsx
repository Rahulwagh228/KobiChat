'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './not-found.scss';

const NotFound = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number }>>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Generate particles only on client after hydration
  useEffect(() => {
    setIsMounted(true);
    const generatedParticles = [...Array(5)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center" 
         style={{
           background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #2d2d2d 75%, #1a1a1a 100%)',
           backgroundSize: '400% 400%',
           animation: 'gradientShift 15s ease infinite'
         }}>
      
      {/* Multiple animated blob layers */}
      <div className="absolute top-5 left-5 w-48 h-48 bg-white opacity-8 rounded-full animate-blob blur-3xl"></div>
      <div className="absolute top-32 right-10 w-56 h-56 bg-gray-400 opacity-5 rounded-full animate-blob-slow blur-3xl animation-delay-2s"></div>
      <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-gray-500 opacity-7 rounded-full animate-blob blur-3xl animation-delay-4s"></div>
      <div className="absolute bottom-10 right-5 w-48 h-48 bg-gray-400 opacity-8 rounded-full animate-blob-slow blur-3xl animation-delay-3s"></div>

      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-bg-${i}`}
            className="absolute w-1 h-1 bg-gray-400 rounded-full shimmer-text"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 97) % 100}%`,
              animationDelay: `${i * 0.1}s`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-2xl">
        {/* Animated 404 Text with glow */}
        <div className="mb-12">
          <div className="floating-404">
            <h1 className="text-9xl md:text-9xl font-black text-gray-100 drop-shadow-2xl">
              404
            </h1>
          </div>
        </div>

        {/* Animated rocket with enhanced bounce */}
        <div className="mb-12">
          <div className="text-8xl md:text-9xl emoji-bounce" style={{ display: 'inline-block' }}>
            🚀
          </div>
        </div>

        {/* Decorative line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8 opacity-30"></div>

        {/* Text content with staggered animations */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-gray-100 mb-6 animate-fade-in fade-in-delay-1" 
              style={{ textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
            Oops! Page Lost
          </h2>
          <p className="text-lg md:text-xl text-gray-200 opacity-90 max-w-lg mx-auto animate-fade-in fade-in-delay-2 leading-relaxed"
             style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            The page you're looking for has been swallowed by a digital black hole. But don't worry, adventure awaits elsewhere!
          </p>
        </div>

        {/* Decorative floating elements */}
        <div className="flex justify-center gap-6 mb-12">
          <div className="floating-star text-5xl">⭐</div>
          <div className="floating-star text-5xl animation-delay-1s">✨</div>
          <div className="floating-star text-5xl animation-delay-2s">🌟</div>
        </div>

        {/* Secondary decorative elements */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.1s' }}>🚀</div>
          <div className="text-3xl animate-bounce opacity-50" style={{ animationDelay: '0.2s' }}>🎯</div>
          <div className="text-3xl animate-bounce opacity-40" style={{ animationDelay: '0.3s' }}>🌈</div>
        </div>

        {/* CTA Buttons with enhanced styling */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <Link href="/Chat">
            <button
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`px-10 py-4 bg-gray-200 text-gray-900 font-bold rounded-full text-lg transition-all duration-300 transform hover:shadow-2xl cursor-pointer button-glow ${
                isHovering ? 'scale-110 shadow-2xl' : 'scale-100'
              }`}
              style={{
                boxShadow: isHovering ? '0 0 30px rgba(200,200,200,0.5), 0 0 60px rgba(100,100,100,0.3)' : '0 10px 25px rgba(0,0,0,0.5)'
              }}
            >
              Go to Chat 💬
            </button>
          </Link>

          <Link href="/">
            <button className="px-10 py-4 bg-gray-700 bg-opacity-40 backdrop-blur-md border-2 border-gray-400 text-gray-200 font-bold rounded-full text-lg transition-all duration-300 transform hover:scale-110 hover:bg-opacity-60 cursor-pointer button-glow"
                    style={{
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
              Back Home 🏠
            </button>
          </Link>
        </div>

        {/* Footer message with animation */}
        <div className="text-gray-300 opacity-70 text-sm animate-fade-in fade-in-delay-3">
          <p className="shimmer-text">↻ Redirecting you to safety...</p>
        </div>
      </div>

      {/* Floating particles with enhanced effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {isMounted && particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.id * 0.3}s`,
            }}
          >
            {['🎨', '🎭', '🎪', '🎯', '🎲'][particle.id]}
          </div>
        ))}
      </div>

      {/* Optional: Scroll hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-gray-400 opacity-40">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;