import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { validateCsrf, csrfTokenHandler } from '../../middleware/csrf';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, googleLoginSchema, sendPhoneOtpSchema, verifyPhoneOtpSchema, verifyEmailSchema } from './auth.validator';

const router = Router();

// ── Auth-specific rate limiting ──────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Very strict for SMS
  message: { error: 'Too many OTP requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     tags: [Auth]
 *     responses:
 *       200: { description: CSRF token generated }
 */
router.get('/csrf-token', csrfTokenHandler);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful — tokens set as HttpOnly cookies }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login.bind(authController));

router.post('/google', loginLimiter, validate(googleLoginSchema), authController.googleLogin.bind(authController));

router.post('/phone/send-otp', otpLimiter, validate(sendPhoneOtpSchema), authController.sendPhoneOtp.bind(authController));

router.post('/phone/verify-otp', loginLimiter, validate(verifyPhoneOtpSchema), authController.verifyPhoneOtp.bind(authController));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new consumer
 *     tags: [Auth]
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh_token cookie
 *     tags: [Auth]
 *     responses:
 *       200: { description: New tokens set as HttpOnly cookies }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', authLimiter, authController.refresh.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user — clears auth cookies and revokes refresh token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/logout', authenticate, validateCsrf, authController.logout.bind(authController));

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/profile', authenticate, authController.getProfile.bind(authController));

/**
 * GET /api/auth/me - Alias for /profile (convention used by some clients)
 */
router.get('/me', authenticate, authController.me.bind(authController));

/**
 * POST /api/auth/verify-email - Verify email using token from verification email
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail.bind(authController));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword.bind(authController));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/change-password', authenticate, validateCsrf, validate(changePasswordSchema), authController.changePassword.bind(authController));

export default router;
