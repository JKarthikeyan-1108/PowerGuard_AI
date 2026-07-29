// ============================================================
// PowerGuard - Authentication Context
// Manages user auth state, login, logout, register
// ============================================================

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, UserRole, AuthState } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...initialState, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'RESTORE_SESSION':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('powerguard_user');
    const savedToken = localStorage.getItem('powerguard_token');
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as User;
        dispatch({ type: 'RESTORE_SESSION', payload: { user, token: savedToken } });
      } catch {
        localStorage.removeItem('powerguard_user');
        localStorage.removeItem('powerguard_token');
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  }, []);

  const login = async (email: string, _password: string, role: UserRole): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login - find user by role or create one
    let user = mockUsers.find(u => u.role === role);
    if (!user) {
      user = {
        id: Math.random().toString(36).substring(7),
        name: email.split('@')[0],
        email,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
    }

    const token = `mock_jwt_${role}_${Date.now()}`;
    
    localStorage.setItem('powerguard_user', JSON.stringify(user));
    localStorage.setItem('powerguard_token', token);
    
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return true;
  };

  const register = async (name: string, email: string, _password: string, role: UserRole): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    const user: User = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const token = `mock_jwt_${role}_${Date.now()}`;
    
    localStorage.setItem('powerguard_user', JSON.stringify(user));
    localStorage.setItem('powerguard_token', token);
    
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('powerguard_user');
    localStorage.removeItem('powerguard_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    if (state.user) {
      localStorage.setItem('powerguard_user', JSON.stringify({ ...state.user, ...updates }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
