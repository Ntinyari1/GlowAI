import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface User {
  username: string;
  email: string;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    setLocation('/login');
  }, [setLocation]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    token: user?.token || '',
  };
}
