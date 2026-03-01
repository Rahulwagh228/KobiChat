'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from './Components/LoginForm';
import SignupForm from './Components/SignupForm';
import FloatingStars from './Components/FloatingStars';
import './styles/auth-page.scss';

function AuthContent() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle query params for view switching
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'signup') {
      setIsLoginView(false);
    } else if (view === 'login') {
      setIsLoginView(true);
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    const token = (() => {
      try {
        const kobiData = localStorage.getItem('Kobi');
        return kobiData ? JSON.parse(kobiData).token : null;
      } catch {
        return null;
      }
    })();
    if (token) {
      router.push('/Chat');
    }
  }, [router]);

  const handleSwitchToSignup = () => {
    setIsLoginView(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginView(true);
  };

  const handleLoginSuccess = (token: string) => {
    setIsLoading(true);
    // Small delay for smooth transition
    setTimeout(() => {
      router.push('/Chat');
    }, 500);
  };

  const handleSignupSuccess = (token: string) => {
    setIsLoading(true);
    // Small delay for smooth transition
    setTimeout(() => {
      router.push('/Chat');
    }, 500);
  };

  return (
    <div className="auth-page-container">
      {/* Floating Stars Background */}
      <div className="floating-stars-container">
        <FloatingStars />
      </div>

      {/* Auth Content */}
      <div className="auth-content">
        <div className="auth-wrapper">
          {/* Logo/Brand */}
          <div className="auth-header">
            <h1 className="brand-title">Kobi Chat</h1>
            <p className="brand-subtitle">Connect & Share</p>
          </div>

          {/* Form Container with Sliding Animation */}
          <div className="form-container">
            <div className={`form-wrapper ${isLoginView ? 'login-active' : 'signup-active'}`}>
              <LoginForm 
                onSwitchToSignup={handleSwitchToSignup}
                onLoginSuccess={handleLoginSuccess}
                isLoading={isLoading}
              />
              <SignupForm 
                onSwitchToLogin={handleSwitchToLogin}
                onSignupSuccess={handleSignupSuccess}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="auth-page-container"><p>Loading...</p></div>}>
      <AuthContent />
    </Suspense>
  );
}
