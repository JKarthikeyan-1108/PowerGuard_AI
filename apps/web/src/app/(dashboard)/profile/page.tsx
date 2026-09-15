'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  AlertCircle,
  Key,
  Smartphone,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { changePassword } from '@/lib/auth-api';

// ── Tabs ─────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'connected', label: 'Connected Accounts', icon: Globe },
] as const;

type Tab = (typeof TABS)[number]['id'];

// ── Change Password Schema ────────────────────────────────
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ── Shared Input Classes ──────────────────────────────────
function pwInputCls(hasError?: boolean) {
  return `w-full h-11 pl-11 pr-12 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
    hasError
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
  }`;
}

// ── Profile Tab ───────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#2F75B5] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#0F4C81]/20">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${user?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2F75B5]/10 text-[#2F75B5] dark:bg-[#2F75B5]/20 dark:text-[#60a5fa]">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          { label: 'First Name', value: user?.firstName, icon: User },
          { label: 'Last Name', value: user?.lastName, icon: User },
          { label: 'Email', value: user?.email, icon: Mail },
          { label: 'Phone', value: user?.phone || 'Not provided', icon: Phone },
        ] as const).map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{value || '—'}</p>
          </div>
        ))}
      </div>

      {/* Verification status */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Verification Status</h4>
        <div className="space-y-2.5">
          {[
            { icon: Mail, label: 'Email', verified: user?.emailVerified },
            { icon: Phone, label: 'Phone', verified: !!(user as any)?.phoneVerified },
          ].map(({ icon: Icon, label, verified }) => (
            <div key={label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                {verified ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Not verified</span>
                  </div>
                )}
              </div>
              <div className="mt-2 border-t border-gray-100 dark:border-gray-700/50 last:hidden" />
            </div>
          ))}
        </div>
      </div>

      {/* Last login */}
      {user?.lastLoginAt && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Key className="h-3.5 w-3.5" />
          Last sign-in: {new Date(user.lastLoginAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────
function SecurityTab() {
  const { logout } = useAuth();
  const [shows, setShows] = useState({ current: false, new: false, confirm: false });
  const [isChanging, setIsChanging] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setIsChanging(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      form.reset();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to change password';
      toast.error(msg);
      form.setError('currentPassword', { message: 'Incorrect current password' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      toast.error('Failed to sign out');
      setIsLoggingOut(false);
    }
  };

  const toggle = (key: keyof typeof shows) => setShows((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-5">
      {/* Change Password Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F75B5]/10 dark:bg-[#2F75B5]/20">
            <Key className="h-4.5 w-4.5 text-[#2F75B5]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Keep your account secure with a strong password</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-3" noValidate>
          {([
            { id: 'sec-current', label: 'Current Password', field: 'currentPassword' as const, showKey: 'current' as const, placeholder: 'Your current password', autoComplete: 'current-password' },
            { id: 'sec-new', label: 'New Password', field: 'newPassword' as const, showKey: 'new' as const, placeholder: 'New strong password', autoComplete: 'new-password' },
            { id: 'sec-confirm', label: 'Confirm New Password', field: 'confirmPassword' as const, showKey: 'confirm' as const, placeholder: 'Repeat new password', autoComplete: 'new-password' },
          ]).map(({ id, label, field, showKey, placeholder, autoComplete }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id={id}
                  type={shows[showKey] ? 'text' : 'password'}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  {...form.register(field)}
                  className={pwInputCls(!!form.formState.errors[field])}
                />
                <button type="button" tabIndex={-1} onClick={() => toggle(showKey)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                  {shows[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors[field] && (
                <p className="mt-1.5 text-xs text-red-500">{form.formState.errors[field]?.message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={isChanging}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isChanging ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : <><Shield className="h-4 w-4" /> Update Password</>}
          </button>
        </form>
      </div>

      {/* Sessions Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
            <LogOut className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Active Sessions</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sign out from all devices and revoke all refresh tokens</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogoutAll}
          disabled={isLoggingOut}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing out...</> : <><LogOut className="h-4 w-4" /> Sign Out All Sessions</>}
        </button>
      </div>
    </div>
  );
}

// ── Connected Accounts Tab ────────────────────────────────
function ConnectedAccountsTab() {
  const { user } = useAuth();

  const methods = [
    {
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      label: 'Google',
      connected: !!(user as any)?.googleId,
      description: (user as any)?.googleId ? 'Account is linked to Google' : 'Not yet linked',
    },
    {
      icon: <Smartphone className="h-5 w-5 text-emerald-500" />,
      label: 'Phone Number',
      connected: !!(user as any)?.phoneVerified,
      description: user?.phone ? `Verified: ${user.phone}` : 'Not linked',
    },
    {
      icon: <Mail className="h-5 w-5 text-[#2F75B5]" />,
      label: 'Email & Password',
      connected: true,
      description: user?.email || 'Primary auth method',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Authentication methods linked to your PowerGuard account. JWT tokens are stored in secure HttpOnly cookies.
      </p>
      {methods.map(({ icon, label, connected, description }) => (
        <div key={label} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Not linked</span>
          )}
        </div>
      ))}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 mt-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Account linking/unlinking will be available in an upcoming update. Contact your administrator for urgent changes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-0">
      {/* Page header */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile, security, and connected accounts
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-6 bg-gray-50 dark:bg-gray-800/60">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-white dark:bg-gray-900 text-[#0F4C81] dark:text-[#60a5fa] shadow-sm border border-gray-200/80 dark:border-gray-700'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'connected' && <ConnectedAccountsTab />}
      </motion.div>
    </div>
  );
}
