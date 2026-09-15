'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { clearCsrfToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state by validating the session against the backend.
  // The HttpOnly access_token cookie is sent automatically.
  // We store user profile in localStorage only for fast hydration (non-sensitive data).
  useEffect(() => {
    const initAuth = async () => {
      // First, try fast hydration from localStorage (non-sensitive profile data)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }

      // Then validate the session against the backend
      try {
        const { data } = await api.get('/auth/profile');
        if (data.success && data.data) {
          const profileUser: User = {
            id: data.data.id,
            email: data.data.email,
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            phone: data.data.phone,
            avatar: data.data.avatar,
            role: data.data.roles?.[0]?.name || 'CONSUMER',
            status: data.data.status,
            emailVerified: data.data.emailVerified,
            lastLoginAt: data.data.lastLoginAt,
            createdAt: data.data.createdAt,
            consumerProfile: data.data.consumerProfile,
            utilityOfficer: data.data.utilityOfficer,
          };
          setUser(profileUser);
          localStorage.setItem('user', JSON.stringify(profileUser));
          connectSocket();
        }
      } catch {
        // Session is invalid or expired — clear local state
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    // Backend sets HttpOnly cookies automatically on successful login
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/login', { email, password });

    const loggedInUser = data.data.user;
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    connectSocket();

    return loggedInUser;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string): Promise<User> => {
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/google', { idToken: credential });

    const loggedInUser = data.data.user;
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    connectSocket();

    return loggedInUser;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    const { data } = await api.post<{ success: boolean; message: string }>('/auth/phone/send-otp', { phone });
    return data;
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, code: string): Promise<User> => {
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/phone/verify-otp', { phone, code });

    const loggedInUser = data.data.user;
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    connectSocket();

    return loggedInUser;
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<User> => {
    // Backend sets HttpOnly cookies automatically on successful registration
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/register', registerData);

    const registeredUser = data.data.user;
    setUser(registeredUser);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    connectSocket();

    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Backend clears HttpOnly cookies and revokes refresh token
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors — still clear local state
    } finally {
      localStorage.removeItem('user');
      clearCsrfToken();
      setUser(null);
      disconnectSocket();
      router.push('/login');
    }
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
