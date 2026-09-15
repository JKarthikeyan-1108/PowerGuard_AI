/**
 * PowerGuard Auth API Client
 *
 * Centralized auth-specific API calls.
 * All requests use HttpOnly cookies automatically via the axios instance.
 * JWT tokens are NEVER stored in localStorage.
 */
import api from './api';

// ── Types ────────────────────────────────────────────────

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

// ── Auth API functions ───────────────────────────────────

/**
 * Request a password reset email.
 * Always returns success for security — backend never reveals if email exists.
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  return data;
}

/**
 * Reset password using a one-time token from email.
 * Throws AppError if token is invalid/expired.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  const { data } = await api.post<ResetPasswordResponse>('/auth/reset-password', {
    token,
    newPassword,
  });
  return data;
}

/**
 * Change password for an authenticated user.
 * Requires current password verification.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
}

/**
 * Verify email address using token from verification email.
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const { data } = await api.post<VerifyEmailResponse>('/auth/verify-email', { token });
  return data;
}

/**
 * Get CSRF token for state-changing requests.
 * This is called automatically by the API interceptor —
 * only call directly if you need to pre-fetch.
 */
export async function getCsrfToken(): Promise<string> {
  const { data } = await api.get<{ csrfToken: string }>('/auth/csrf-token');
  return data.csrfToken;
}
