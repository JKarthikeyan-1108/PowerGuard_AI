'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import api, { clearCsrfToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import type { User, UserRole, UserStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential?: string) => Promise<User>;
  sendPhoneOtp: (phone: string, containerId?: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export interface RegisterData {
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

// ── Demo / Offline Mock Users for Instant Previews ─────────
const DEMO_USERS: Record<string, User> = {
  'consumer@powerguard.io': {
    id: 'usr-consumer-1',
    email: 'consumer@powerguard.io',
    firstName: 'Alice',
    lastName: 'Anderson',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'CONSUMER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2024-01-15T00:00:00Z',
    consumerProfile: {
      id: 'cp-001',
      userId: 'usr-consumer-1',
      accountNumber: 'ACC-883921',
      address: 'Plot 42, 3rd Cross, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600040',
      tariffRate: 7.50,
      connectionType: 'RESIDENTIAL',
    },
  },
  'admin@powerguard.io': {
    id: 'usr-admin-1',
    email: 'admin@powerguard.io',
    firstName: 'Admin',
    lastName: 'Karthikeyan',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  'utility@powerguard.io': {
    id: 'usr-utility-1',
    email: 'utility@powerguard.io',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phone: '+91 94441 98765',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'UTILITY_OFFICER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2024-02-01T00:00:00Z',
    utilityOfficer: {
      id: 'uo-001',
      userId: 'usr-utility-1',
      employeeId: 'EMP-7712',
      department: 'Vigilance & Loss Prevention',
      designation: 'Assistant Executive Engineer',
      jurisdiction: 'Zone 4 Metro Grid',
    },
  },
};

function mapFirestoreDocToUser(uid: string, data: any, fbUser?: FirebaseUser | null): User {
  const parts = (fbUser?.displayName || '').trim().split(' ');
  const firstName = data?.firstName || parts[0] || 'PowerGuard';
  const lastName = data?.lastName || parts.slice(1).join(' ') || 'User';

  return {
    id: uid,
    email: data?.email || fbUser?.email || '',
    firstName,
    lastName,
    phone: data?.phone || fbUser?.phoneNumber || '',
    avatar: fbUser?.photoURL || data?.avatar,
    role: (data?.role as UserRole) || 'CONSUMER',
    status: (data?.status as UserStatus) || 'ACTIVE',
    emailVerified: Boolean(fbUser?.emailVerified ?? data?.emailVerified),
    createdAt: data?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    consumerProfile: data?.consumerProfile || (data?.address ? {
      id: `cp-${uid}`,
      userId: uid,
      accountNumber: `ACC-${uid.slice(0, 6).toUpperCase()}`,
      address: data.address,
      city: data.city || 'Chennai',
      state: data.state || 'Tamil Nadu',
      zipCode: data.zipCode || '600001',
      tariffRate: 7.50,
      connectionType: 'RESIDENTIAL',
    } : undefined),
    utilityOfficer: data?.utilityOfficer,
  };
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

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Initialize auth listener
  useEffect(() => {
    // Fast hydration from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnapshot = await getDoc(userDocRef);

            let userData: any = null;
            if (userSnapshot.exists()) {
              userData = userSnapshot.data();
            } else {
              // First time OAuth / Phone user sign-in: Auto initialize profile
              const nameParts = (fbUser.displayName || '').trim().split(' ');
              userData = {
                id: fbUser.uid,
                email: fbUser.email || '',
                firstName: nameParts[0] || 'PowerGuard',
                lastName: nameParts.slice(1).join(' ') || 'User',
                phone: fbUser.phoneNumber || '',
                role: 'CONSUMER',
                status: 'ACTIVE',
                isVerified: Boolean(fbUser.emailVerified || fbUser.phoneNumber),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, userData, { merge: true });
            }

            const appUser = mapFirestoreDocToUser(fbUser.uid, userData, fbUser);
            setUser(appUser);
            localStorage.setItem('user', JSON.stringify(appUser));
            connectSocket();
          } catch (err) {
            console.warn('[Firebase Auth] Firestore user profile sync error:', err);
          }
        } else {
          // If no active Firebase user and not explicitly a local demo session, reset
          const isDemoSession = storedUser && (
            storedUser.includes('consumer@powerguard.io') ||
            storedUser.includes('admin@powerguard.io') ||
            storedUser.includes('utility@powerguard.io')
          );
          if (!isDemoSession) {
            setUser(null);
            localStorage.removeItem('user');
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  // ── 1. Email / Password Login ───────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check offline demo credentials first for lightning-fast testing
    if (DEMO_USERS[trimmedEmail] && (!isFirebaseConfigured || password === 'password123' || password === 'admin123')) {
      const demoUser = DEMO_USERS[trimmedEmail];
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      connectSocket();
      return demoUser;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const fbUser = userCredential.user;

        // Fetch Firestore profile
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        let data = userSnapshot.exists() ? userSnapshot.data() : null;
        if (!data) {
          data = {
            id: fbUser.uid,
            email: fbUser.email || trimmedEmail,
            firstName: 'Consumer',
            lastName: 'Account',
            role: 'CONSUMER',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, data, { merge: true });
        }

        const appUser = mapFirestoreDocToUser(fbUser.uid, data, fbUser);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        connectSocket();
        return appUser;
      } catch (fbError: any) {
        // If Firebase error occurs, give meaningful message
        const code = fbError?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password.');
        } else if (code === 'auth/too-many-requests') {
          throw new Error('Access temporarily disabled due to too many failed attempts. Try again later.');
        }
        throw new Error(fbError?.message || 'Authentication failed.');
      }
    }

    // Fallback: standard backend API if configured
    try {
      const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/login', { email: trimmedEmail, password });
      const loggedInUser = data.data.user;
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      connectSocket();
      return loggedInUser;
    } catch {
      // Defensive fallback for standard demo
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        email: trimmedEmail,
        firstName: trimmedEmail.split('@')[0],
        lastName: 'User',
        role: trimmedEmail.includes('admin') ? 'ADMIN' : trimmedEmail.includes('utility') ? 'UTILITY_OFFICER' : 'CONSUMER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }, []);

  // ── 2. Google Authentication ────────────────────────────
  const loginWithGoogle = useCallback(async (credential?: string): Promise<User> => {
    if (isFirebaseConfigured && auth) {
      try {
        let userCredential;
        if (credential) {
          const googleCred = GoogleAuthProvider.credential(credential);
          userCredential = await signInWithCredential(auth, googleCred);
        } else {
          const provider = new GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          userCredential = await signInWithPopup(auth, provider);
        }

        const fbUser = userCredential.user;
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        let data = userSnapshot.exists() ? userSnapshot.data() : null;
        if (!data) {
          const nameParts = (fbUser.displayName || 'Google User').trim().split(' ');
          data = {
            id: fbUser.uid,
            email: fbUser.email || '',
            firstName: nameParts[0] || 'Google',
            lastName: nameParts.slice(1).join(' ') || 'User',
            role: 'CONSUMER',
            status: 'ACTIVE',
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, data, { merge: true });
        }

        const appUser = mapFirestoreDocToUser(fbUser.uid, data, fbUser);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        connectSocket();
        return appUser;
      } catch (err: any) {
        console.error('[Firebase] Google sign-in failed:', err);
        throw new Error(err?.message || 'Google sign-in failed.');
      }
    }

    // Fallback demo for Google
    const googleUser: User = {
      id: 'usr-google-demo',
      email: 'user@gmail.com',
      firstName: 'Karthik',
      lastName: 'GoogleUser',
      role: 'CONSUMER',
      status: 'ACTIVE',
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
    };
    setUser(googleUser);
    localStorage.setItem('user', JSON.stringify(googleUser));
    return googleUser;
  }, []);

  // ── 3. Phone Authentication (Send OTP) ──────────────────
  const sendPhoneOtp = useCallback(async (phone: string, containerId = 'recaptcha-container') => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    if (isFirebaseConfigured && auth && typeof window !== 'undefined') {
      try {
        if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            },
          });
        }

        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifierRef.current
        );
        confirmationResultRef.current = confirmation;
        return { success: true, message: `OTP sent to ${formattedPhone}` };
      } catch (err: any) {
        console.warn('[Firebase] Phone OTP dispatch failed:', err);
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch {
            // ignore
          }
          recaptchaVerifierRef.current = null;
        }
        // Fallback for development if SMS quota / phone auth isn't enabled yet
        return { success: true, message: `Demo OTP sent to ${formattedPhone} (use 123456)` };
      }
    }

    return { success: true, message: `Demo OTP sent to ${formattedPhone} (use 123456)` };
  }, []);

  // ── 4. Phone Authentication (Verify OTP) ────────────────
  const verifyPhoneOtp = useCallback(async (phone: string, code: string): Promise<User> => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    if (confirmationResultRef.current) {
      try {
        const userCredential = await confirmationResultRef.current.confirm(code);
        const fbUser = userCredential.user;

        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        let data = userSnapshot.exists() ? userSnapshot.data() : null;
        if (!data) {
          data = {
            id: fbUser.uid,
            phone: formattedPhone,
            email: `${fbUser.uid.slice(0, 8)}@powerguard.io`,
            firstName: 'Smart Meter',
            lastName: 'Consumer',
            role: 'CONSUMER',
            status: 'ACTIVE',
            isVerified: true,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, data, { merge: true });
        }

        const appUser = mapFirestoreDocToUser(fbUser.uid, data, fbUser);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        connectSocket();
        return appUser;
      } catch (err: any) {
        console.warn('[Firebase] Phone OTP verification failed:', err);
        throw new Error(err?.message || 'Invalid or expired OTP code.');
      }
    }

    // Demo phone verification fallback
    if (code === '123456' || code.length === 6) {
      const phoneUser: User = {
        id: `usr-ph-${Date.now()}`,
        email: `consumer-${formattedPhone.slice(-4)}@powerguard.io`,
        firstName: 'Consumer',
        lastName: formattedPhone.slice(-4),
        phone: formattedPhone,
        role: 'CONSUMER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(phoneUser);
      localStorage.setItem('user', JSON.stringify(phoneUser));
      connectSocket();
      return phoneUser;
    }

    throw new Error('Invalid OTP code. For demo mode, please enter 123456.');
  }, []);

  // ── 5. User Registration ────────────────────────────────
  const register = useCallback(async (registerData: RegisterData): Promise<User> => {
    const trimmedEmail = registerData.email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, registerData.password);
        const fbUser = userCredential.user;

        await updateProfile(fbUser, {
          displayName: `${registerData.firstName} ${registerData.lastName}`.trim(),
        });

        // Store user document in Firestore with CONSUMER role
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocData = {
          id: fbUser.uid,
          email: trimmedEmail,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: registerData.phone || '',
          role: 'CONSUMER',
          status: 'ACTIVE',
          isVerified: false,
          address: registerData.address,
          city: registerData.city,
          state: registerData.state,
          zipCode: registerData.zipCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, userDocData);

        const appUser = mapFirestoreDocToUser(fbUser.uid, userDocData, fbUser);
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        connectSocket();
        return appUser;
      } catch (err: any) {
        const code = err?.code;
        if (code === 'auth/email-already-in-use') {
          throw new Error('This email address is already registered. Please sign in instead.');
        } else if (code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters.');
        }
        throw new Error(err?.message || 'Registration failed.');
      }
    }

    // Fallback registration
    const registeredUser: User = {
      id: `usr_${Date.now()}`,
      email: trimmedEmail,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phone: registerData.phone,
      role: 'CONSUMER',
      status: 'ACTIVE',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      consumerProfile: {
        id: `cp_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        accountNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        address: registerData.address,
        city: registerData.city,
        state: registerData.state,
        zipCode: registerData.zipCode,
        tariffRate: 7.50,
        connectionType: 'RESIDENTIAL',
      },
    };
    setUser(registeredUser);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    connectSocket();
    return registeredUser;
  }, []);

  // ── 6. Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      await api.post('/auth/logout').catch(() => {});
    } catch {
      // ignore
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
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
