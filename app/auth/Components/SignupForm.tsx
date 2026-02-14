'use client';

import React, { useState } from 'react';
import '../styles/auth-forms.scss';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (token: string) => void;
  isLoading?: boolean;
}

export default function SignupForm({ onSwitchToLogin, onSignupSuccess, isLoading = false }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateForm = (): boolean => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.token) {
        const kobiAuth = {
          token: data.token,
          user: data.user || { id: "", username: "", email: "" },
        };
        localStorage.setItem("Kobi", JSON.stringify(kobiAuth));
        onSignupSuccess(data.token);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form signup-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create Account</h2>
      <p className="form-subtitle">Join us today</p>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          className="form-input"
          disabled={loading || isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
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
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          className="form-input"
          disabled={loading || isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
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
          'Sign Up'
        )}
      </button>

      <p className="form-footer">
        Already have an account?{' '}
        <button
          type="button"
          className="switch-btn"
          onClick={onSwitchToLogin}
          disabled={loading || isLoading}
        >
          Click here to login
        </button>
      </p>
    </form>
  );
}
