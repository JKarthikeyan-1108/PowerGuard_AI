'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  User,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ── Password strength helper ─────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-400' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' };
}

// ── Zod Schema ───────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50, 'Too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Too long'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^\+?[\d\s\-()]{10,15}$/.test(v),
        'Please enter a valid phone number'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    agreeToTerms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ── Field Component ───────────────────────────────────────
function FormField({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Input Classes Helper ────────────────────────────────
function inputCls(hasError?: boolean) {
  return `w-full h-12 px-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
    hasError
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
  }`;
}

function inputWithIconCls(hasError?: boolean) {
  return `w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
    hasError
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/60'
  }`;
}

// ── Main Component ───────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      agreeToTerms: false,
    },
  });

  const watchedPassword = form.watch('password');
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const user = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });
      toast.success('Account created! Welcome to PowerGuard.');
      router.push('/consumer');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) {
        form.setError('email', { message: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = [
    { met: watchedPassword.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(watchedPassword), label: 'One uppercase letter' },
    { met: /[0-9]/.test(watchedPassword), label: 'One number' },
  ];

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
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#20C997] to-[#10b981] shadow-xl shadow-emerald-500/30">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Join PowerGuard as a consumer
        </p>
      </div>

      {/* Role notice */}
      <div className="mb-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex items-center gap-2.5">
        <div className="h-5 w-5 shrink-0 rounded-full bg-[#2F75B5] flex items-center justify-center">
          <span className="text-[10px] text-white font-bold">i</span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Public registration creates <strong>Consumer</strong> accounts only. Utility Officers and Admins are provisioned by your organization.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" error={form.formState.errors.firstName?.message} required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="John"
                {...form.register('firstName')}
                className={inputWithIconCls(!!form.formState.errors.firstName)}
              />
            </div>
          </FormField>

          <FormField label="Last Name" error={form.formState.errors.lastName?.message} required>
            <input
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              {...form.register('lastName')}
              className={inputCls(!!form.formState.errors.lastName)}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Email Address" error={form.formState.errors.email?.message} required>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register('email')}
              className={inputWithIconCls(!!form.formState.errors.email)}
            />
          </div>
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number" error={form.formState.errors.phone?.message}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210 (optional)"
              {...form.register('phone')}
              className={inputWithIconCls(!!form.formState.errors.phone)}
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField label="Password" error={form.formState.errors.password?.message} required>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...form.register('password')}
              className={`${inputWithIconCls(!!form.formState.errors.password)} pr-12`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Password strength bar */}
          {watchedPassword && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${strength.score >= 4 ? 'text-emerald-600' : strength.score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                {strength.label}
              </p>
              <div className="space-y-1">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-1.5">
                    {req.met ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                    )}
                    <span className={`text-xs ${req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField label="Confirm Password" error={form.formState.errors.confirmPassword?.message} required>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...form.register('confirmPassword')}
              className={`${inputWithIconCls(!!form.formState.errors.confirmPassword)} pr-12`}
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
        </FormField>

        {/* Address section */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Address Information</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="space-y-3">
            <FormField label="Address" error={form.formState.errors.address?.message} required>
              <input
                type="text"
                autoComplete="street-address"
                placeholder="123 Main Street"
                {...form.register('address')}
                className={inputCls(!!form.formState.errors.address)}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" error={form.formState.errors.city?.message} required>
                <input
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Mumbai"
                  {...form.register('city')}
                  className={inputCls(!!form.formState.errors.city)}
                />
              </FormField>
              <FormField label="State" error={form.formState.errors.state?.message} required>
                <input
                  type="text"
                  autoComplete="address-level1"
                  placeholder="Maharashtra"
                  {...form.register('state')}
                  className={inputCls(!!form.formState.errors.state)}
                />
              </FormField>
            </div>
            <FormField label="Zip Code" error={form.formState.errors.zipCode?.message} required>
              <input
                type="text"
                autoComplete="postal-code"
                placeholder="400001"
                {...form.register('zipCode')}
                className={inputCls(!!form.formState.errors.zipCode)}
              />
            </FormField>
          </div>
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="agree-terms"
              type="checkbox"
              {...form.register('agreeToTerms')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2F75B5] focus:ring-[#2F75B5]/30 shrink-0"
            />
            <label htmlFor="agree-terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-[#2F75B5] hover:text-[#0F4C81] transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-[#2F75B5] hover:text-[#0F4C81] transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>
          {form.formState.errors.agreeToTerms && (
            <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.agreeToTerms.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#20C997] to-[#10b981] text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-[#1aad83] hover:to-[#0ea472] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Creating account...</>
          ) : (
            <><ArrowRight className="h-4.5 w-4.5" /> Create Account</>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#2F75B5] hover:text-[#0F4C81] transition-colors">
          Sign In
        </Link>
      </p>

      {/* Footer (mobile only) */}
      <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-6 lg:hidden">
        © {new Date().getFullYear()} PowerGuard. All rights reserved.
      </p>
    </motion.div>
  );
}
