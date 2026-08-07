import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validator';

const router = Router();

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
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), authController.login.bind(authController));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new consumer
 *     tags: [Auth]
 */
router.post('/register', validate(registerSchema), authController.register.bind(authController));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refresh.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

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
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));

export default router;
