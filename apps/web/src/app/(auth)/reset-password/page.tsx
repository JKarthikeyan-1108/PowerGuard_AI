'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

const schema = z
  .object({
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

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to reset password. The link may have expired.';
      toast.error(msg);
      form.setError('newPassword', { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    `w-full h-12 pl-11 pr-12 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
      hasError
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
    }`;

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full text-center space-y-4">
        <div className="flex justify-center mb-5">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 shadow-xl shadow-red-500/30">
            <AlertCircle className="h-9 w-9 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">Invalid Reset Link</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-sm shadow-lg mt-2 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          Request New Link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full text-center space-y-4">
        <div className="flex justify-center mb-5">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="h-9 w-9 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">Password Reset!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your password has been reset successfully. You&apos;ll be redirected to the sign-in page in a moment.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-sm shadow-lg mt-2 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          Sign In Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  return (
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
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#2F75B5] shadow-xl shadow-[#0F4C81]/30">
          <Lock className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
          Set new password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...form.register('newPassword')}
              className={inputCls(!!form.formState.errors.newPassword)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              {...form.register('confirmPassword')}
              className={inputCls(!!form.formState.errors.confirmPassword)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Password requirements:</p>
          {[
            { met: form.watch('newPassword').length >= 8, label: 'At least 8 characters' },
            { met: /[A-Z]/.test(form.watch('newPassword')), label: 'One uppercase letter' },
            { met: /[0-9]/.test(form.watch('newPassword')), label: 'One number' },
          ].map((req) => (
            <div key={req.label} className="flex items-center gap-1.5">
              <CheckCircle2 className={`h-3.5 w-3.5 transition-colors ${req.met ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
              <span className={`text-xs transition-colors ${req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-[15px] shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl hover:shadow-[#0F4C81]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Resetting password...</>
          ) : (
            <><ArrowRight className="h-4.5 w-4.5" /> Reset Password</>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>

      {/* Footer (mobile only) */}
      <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-7 lg:hidden">
        © {new Date().getFullYear()} PowerGuard. All rights reserved.
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#2F75B5]/30 border-t-[#2F75B5] rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
