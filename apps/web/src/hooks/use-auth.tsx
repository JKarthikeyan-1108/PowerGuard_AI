'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Helper to set cookie for middleware
const setSessionCookie = (user: User) => {
  const sessionData = JSON.stringify({ role: user.role, userId: user.id });
  document.cookie = `powerguard-session=${sessionData}; path=/; max-age=604800; SameSite=Lax`; // 7 days
};

const clearSessionCookie = () => {
  document.cookie = 'powerguard-session=; path=/; max-age=0';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setSessionCookie(parsedUser); // Ensure cookie is set
        connectSocket();
      } catch {
        localStorage.clear();
        clearSessionCookie();
      }
    } else {
      clearSessionCookie();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    setSessionCookie(data.data.user);
    setUser(data.data.user);
    connectSocket();
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', registerData);
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    setSessionCookie(data.data.user);
    setUser(data.data.user);
    connectSocket();
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      clearSessionCookie();
      setUser(null);
      disconnectSocket();
      router.push('/login');
    }
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setSessionCookie(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
