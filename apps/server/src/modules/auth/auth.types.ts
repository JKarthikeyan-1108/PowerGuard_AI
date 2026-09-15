import { z } from 'zod';
import { loginSchema, registerSchema, refreshTokenSchema, googleLoginSchema, sendPhoneOtpSchema, verifyPhoneOtpSchema } from './auth.validator';

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type SendPhoneOtpInput = z.infer<typeof sendPhoneOtpSchema>;
export type VerifyPhoneOtpInput = z.infer<typeof verifyPhoneOtpSchema>;

