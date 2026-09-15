'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Always shows success — backend intentionally does not reveal if email exists
      await api.post('/auth/forgot-password', { email: data.email });
    } catch {
      // Swallow error — show success regardless for security
    } finally {
      setSubmittedEmail(data.email);
      setSubmitted(true);
      setIsLoading(false);
    }
  };

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

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#2F75B5] shadow-xl shadow-[#0F4C81]/30">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                Forgot your password?
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                No worries. Enter your email and we&apos;ll send you a reset link if an account exists.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...form.register('email')}
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                      form.formState.errors.email
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
                    }`}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#2F75B5] text-white font-semibold text-[15px] shadow-lg shadow-[#0F4C81]/25 hover:shadow-xl hover:shadow-[#0F4C81]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Sending reset link...</>
                ) : (
                  <><ArrowRight className="h-4.5 w-4.5" /> Send Reset Link</>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Success state */}
            <div className="flex justify-center mb-5">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9 text-white" />
              </div>
            </div>

            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
                Check your email
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                If an account exists for{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{submittedEmail}</span>,
                a password reset link has been sent. Check your inbox and spam folder.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 mb-6 space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-gray-300">Next steps:</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Open the email from PowerGuard</li>
                <li>Click the &quot;Reset Password&quot; link</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
              <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                The link expires in <strong>1 hour</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setSubmitted(false); form.reset(); }}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2F75B5]/30 text-[#2F75B5] dark:text-[#60a5fa] font-semibold text-sm hover:border-[#2F75B5]/60 hover:bg-[#2F75B5]/5 active:scale-[0.98] transition-all duration-200"
            >
              Try a different email
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to login */}
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
