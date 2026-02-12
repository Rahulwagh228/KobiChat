/**
 * Auth Hook
 * Provides authentication context and utilities
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = authService.getToken();
      setToken(storedToken);
      setIsAuthenticated(!!storedToken);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    authService.removeToken();
    setIsAuthenticated(false);
    setToken(null);
    router.push('/auth');
  };

  return {
    isAuthenticated,
    token,
    isLoading,
    logout,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
