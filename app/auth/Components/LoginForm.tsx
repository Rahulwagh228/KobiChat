'use client';

import React, { useState } from 'react';
import '../styles/auth-forms.scss';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: (token: string) => void;
  isLoading?: boolean;
}

export default function LoginForm({ onSwitchToSignup, onLoginSuccess, isLoading = false }: LoginFormProps) {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.emailOrUsername || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.token) {
        const kobiAuth = {
          token: data.token,
          user: data.user || { id: "", username: "", email: "" },
        };
        localStorage.setItem("Kobi", JSON.stringify(kobiAuth));
        onLoginSuccess(data.token);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form login-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Welcome Back</h2>
      <p className="form-subtitle">Sign in to your account</p>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="emailOrUsername" className="form-label">
          Email or Username
        </label>
        <input
          type="text"
          id="emailOrUsername"
          name="emailOrUsername"
          placeholder="Enter your email or username"
          value={formData.emailOrUsername}
          onChange={handleChange}
          className="form-input"
          disabled={loading || isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          className="form-input"
          disabled={loading || isLoading}
        />
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={loading || isLoading}
      >
        {loading || isLoading ? (
          <span className="btn-loader"></span>
        ) : (
          'Login'
        )}
      </button>

      <p className="form-footer">
        Don't have an account?{' '}
        <button
          type="button"
          className="switch-btn"
          onClick={onSwitchToSignup}
          disabled={loading || isLoading}
        >
          Click here to signup
        </button>
      </p>
    </form>
  );
}
