'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Phone,
  Shield,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// ── Zod Schemas ──────────────────────────────────────────
const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^\+?[\d\s\-()]{10,15}$/, 'Please enter a valid phone number'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

type EmailLoginForm = z.infer<typeof emailLoginSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

// ── Helpers ──────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function getRoleRoute(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/super-admin';
    case 'ADMIN': return '/admin';
    case 'UTILITY_OFFICER': return '/utility';
    default: return '/consumer';
  }
}

// ── Tab type ─────────────────────────────────────────────
type AuthTab = 'email' | 'google' | 'phone';

// ── OTP Input Component ──────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    const newVal = next.join('');
    onChange(newVal);
    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white dark:bg-gray-900 ${
            d
              ? 'border-[#2F75B5] text-[#0F4C81] dark:text-[#60a5fa]'
              : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
          } focus:border-[#2F75B5] focus:ring-2 focus:ring-[#2F75B5]/20`}
        />
      ))}
    </div>
  );
}

// ── Countdown Hook ────────────────────────────────────────
function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(0);
  const start = useCallback(() => setSeconds(initial), [initial]);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return { seconds, start };
}

// ── Main Login Page ──────────────────────────────────────
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Phone OTP sub-state
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const { login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { seconds: resendSeconds, start: startResend } = useCountdown(60);

  // ── Email/Password Form ──────────────────────────────
  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const handleEmailLogin = async (data: EmailLoginForm) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push(callbackUrl || getRoleRoute(user.role));
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
      emailForm.setError('password', { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Login ─────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast.error('No credential received from Google');
      return;
    }
    setIsLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success(`Welcome, ${user.firstName}!`);
      router.push(callbackUrl || getRoleRoute(user.role));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phone OTP ────────────────────────────────────────
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const handleSendOtp = async (data: PhoneForm) => {
    setIsLoading(true);
    try {
      await sendPhoneOtp(data.phone);
      setConfirmedPhone(data.phone);
      setPhoneStep('otp');
      startResend();
      toast.success('OTP sent to your phone');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const user = await verifyPhoneOtp(confirmedPhone, otpValue);
      toast.success(`Welcome, ${user.firstName}!`);
      router.push(callbackUrl || getRoleRoute(user.role));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Invalid or expired OTP');
      setOtpValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0) return;
    setIsLoading(true);
    try {
      await sendPhoneOtp(confirmedPhone);
      startResend();
      setOtpValue('');
      toast.success('New OTP sent');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogleConfigured = GOOGLE_CLIENT_ID.length > 10;

  // ── Tab Data ─────────────────────────────────────────
  const tabs: { id: AuthTab; label: string; icon: React.ReactNode }[] = [
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
    { id: 'google', label: 'Google', icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    )},
  ];

  return (
    <GoogleOAuthProvider clientId={isGoogleConfigured ? GOOGLE_CLIENT_ID : 'placeholder'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full"
      >
        {/* Mobile branding */}
        <div className="flex items-center gap-2.5 mb-6 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2F75B5] to-[#00BFFF] shadow-md">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#1F2937] dark:text-white">
            Power<span className="text-[#2F75B5]">Guard</span>
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#2F75B5] shadow-xl shadow-[#0F4C81]/30">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Sign in to your PowerGuard account
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-7 bg-gray-50 dark:bg-gray-800/60 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setPhoneStep('phone');
                setOtpValue('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-[#0F4C81] dark:text-[#60a5fa] shadow-sm border border-gray-200/80 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
              <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...emailForm.register('email')}
                      className={`w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        emailForm.formState.errors.email
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
                      }`}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs font-medium text-[#2F75B5] hover:text-[#0F4C81] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...emailForm.register('password')}
                      className={`w-full h-12 pl-11 pr-12 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        emailForm.formState.errors.password
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  {emailForm.formState.errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">{emailForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    {...emailForm.register('rememberMe')}
                    className="h-4 w-4 rounded border-gray-300 text-[#2F75B5] focus:ring-[#2F75B5]/30 transition"
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 select-none">
                    Remember me for 7 days
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-[15px] shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl hover:shadow-[#0F4C81]/30 hover:from-[#0a3d6e] hover:to-[#2567a0] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Signing in...</>
                  ) : (
                    <><ArrowRight className="h-4.5 w-4.5" /> Sign In</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* PHONE TAB */}
          {activeTab === 'phone' && (
            <motion.div key="phone" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
              <AnimatePresence mode="wait">
                {phoneStep === 'phone' ? (
                  <motion.div key="phone-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4" noValidate>
                      <div>
                        <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="phone-number"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            {...phoneForm.register('phone')}
                            className={`w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                              phoneForm.formState.errors.phone
                                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                                : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
                            }`}
                          />
                        </div>
                        {phoneForm.formState.errors.phone && (
                          <p className="mt-1.5 text-xs text-red-500">{phoneForm.formState.errors.phone.message}</p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                          Enter your number in international format (e.g. +91...)
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-[15px] shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl hover:shadow-[#0F4C81]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Sending OTP...</>
                        ) : (
                          <><ChevronRight className="h-4.5 w-4.5" /> Send OTP</>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="otp-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <div className="space-y-5">
                      {/* OTP sent indicator */}
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                          OTP sent to <span className="font-semibold">{confirmedPhone}</span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                          Enter the 6-digit code
                        </label>
                        <OtpInput value={otpValue} onChange={setOtpValue} />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otpValue.length !== 6}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-[15px] shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Verifying...</>
                        ) : (
                          <><Shield className="h-4.5 w-4.5" /> Verify OTP</>
                        )}
                      </button>

                      {/* Resend + Back */}
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => { setPhoneStep('phone'); setOtpValue(''); }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          ← Change number
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendSeconds > 0 || isLoading}
                          className="flex items-center gap-1.5 text-[#2F75B5] hover:text-[#0F4C81] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* GOOGLE TAB */}
          {activeTab === 'google' && (
            <motion.div key="google" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4285F4]/10">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue with Google</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Sign in securely using your Google account. Your Google identity is verified server-side.
                      </p>
                    </div>
                  </div>
                </div>

                {isGoogleConfigured ? (
                  <div className="flex justify-center">
                    {isLoading ? (
                      <div className="h-12 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting to Google...
                      </div>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google authentication failed')}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width="380"
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400 text-center">
                      Google Sign-In is not configured.{' '}
                      <span className="font-medium">Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-gray-950 px-3 text-gray-400 dark:text-gray-500 font-medium">
              Don&apos;t have an account?
            </span>
          </div>
        </div>

        {/* Create account */}
        <Link
          href="/register"
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2F75B5]/30 text-[#2F75B5] dark:text-[#60a5fa] font-semibold text-sm hover:border-[#2F75B5]/60 hover:bg-[#2F75B5]/5 active:scale-[0.98] transition-all duration-200"
        >
          Create an Account
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Footer (mobile only) */}
        <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-7 lg:hidden">
          © {new Date().getFullYear()} PowerGuard. All rights reserved.
        </p>
      </motion.div>
    </GoogleOAuthProvider>
  );
}
