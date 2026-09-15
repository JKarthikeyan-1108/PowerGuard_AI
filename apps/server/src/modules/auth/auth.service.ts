import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import twilio from 'twilio';
import { authRepository } from './auth.repository';
import { LoginInput, RegisterInput } from './auth.types';
import config from '../../config';
import logger from '../../config/logger';
import { AppError } from '../../middleware/errorHandler';
import { auditService } from '../audit/audit.service';
import prisma from '../../config/database';

export class AuthService {
  async login(input: LoginInput, reqInfo?: { ip?: string, userAgent?: string }) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403);
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new AppError(`Account is locked. Try again after ${user.lockoutUntil.toISOString()}`, 403);
    }

    if (!user.passwordHash) {
      throw new AppError('Invalid email or password. Please use Google or Phone login.', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await authRepository.incrementFailedLogins(user.id);
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Audit log
    await auditService.log(user.id, 'LOGIN', 'auth', undefined, { method: 'email_password' }, reqInfo);

    logger.info(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user as any).roles?.[0]?.name || 'CONSUMER',
        avatar: user.avatar,
        consumerProfile: user.consumerProfile,
        utilityOfficer: user.utilityOfficer,
      },
    };
  }

  async register(input: RegisterInput, reqInfo?: { ip?: string, userAgent?: string }) {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const accountNumber = `PG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      status: 'ACTIVE',
      roles: { connect: { name: 'CONSUMER' } },
      consumerProfile: {
        create: {
          accountNumber,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
        },
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Audit log
    await auditService.log(user.id, 'REGISTER', 'auth', undefined, { role: 'CONSUMER' }, reqInfo);

    logger.info(`New user registered: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user as any).roles?.[0]?.name || 'CONSUMER',
        avatar: user.avatar,
        consumerProfile: user.consumerProfile,
      },
    };
  }

  async refreshAccessToken(refreshTokenStr: string) {
    const storedToken = await authRepository.findRefreshToken(refreshTokenStr);

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await authRepository.deleteRefreshTokenById(storedToken.id);
      throw new AppError('Refresh token expired', 401);
    }

    // Delete old refresh token (rotation)
    await authRepository.deleteRefreshTokenById(storedToken.id);

    const accessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshTokenStr?: string) {
    if (refreshTokenStr) {
      await authRepository.deleteRefreshTokensByToken(refreshTokenStr);
    } else {
      await authRepository.deleteRefreshTokensByUserId(userId);
    }

    await auditService.log(userId, 'LOGOUT', 'auth');

    logger.info(`User logged out: ${userId}`);
  }

  async getProfile(userId: string) {
    const user = await authRepository.findUserProfile(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return success even if user not found for security reasons
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await authRepository.createPasswordResetToken(user.id, token, expiresAt);

    logger.info(`Password reset requested for: ${email}. Token: ${token}`);
    
    // Audit log
    await auditService.log(user.id, 'FORGOT_PASSWORD', 'auth');

    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPasswordStr: string, reqInfo?: { ip?: string, userAgent?: string }) {
    const resetToken = await authRepository.findPasswordResetToken(token);

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const userId = resetToken.userId; 
    
    const passwordHash = await bcrypt.hash(newPasswordStr, 12);
    await authRepository.updatePassword(userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(resetToken.id);
    
    // Audit log
    await auditService.log(userId, 'RESET_PASSWORD', 'auth', undefined, undefined, reqInfo);
    
    return { success: true, message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, currentPasswordStr: string, newPasswordStr: string) {
    const user = await authRepository.findUserProfile(userId);
    if (!user) throw new AppError('User not found', 404);

    // Fetch full user with passwordHash via userId directly
    const fullUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!fullUser) throw new AppError('User not found', 404);

    if (!fullUser.passwordHash) {
      throw new AppError('No password set. Please use Google or Phone login.', 400);
    }

    const isPasswordValid = await bcrypt.compare(currentPasswordStr, fullUser.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid current password', 400);
    }

    const passwordHash = await bcrypt.hash(newPasswordStr, 12);
    await authRepository.updatePassword(userId, passwordHash);
    
    await auditService.log(userId, 'CHANGE_PASSWORD', 'auth');

    return { success: true, message: 'Password changed successfully' };
  }

  async googleLogin(idToken: string, reqInfo?: { ip?: string, userAgent?: string }) {
    const client = new OAuth2Client(config.google.clientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 401);
    }

    const { email, sub: googleId, given_name: firstName, family_name: lastName, picture: avatar } = payload;

    let user = await authRepository.findUserByGoogleId(googleId);

    if (!user) {
      user = await authRepository.findUserByEmail(email);
      if (user) {
        // Link account securely
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
          include: { roles: true, consumerProfile: true, utilityOfficer: true }
        }) as any;
      } else {
        const accountNumber = `PG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        user = await authRepository.createUser({
          email,
          googleId,
          authProvider: 'GOOGLE',
          firstName: firstName || 'Google',
          lastName: lastName || 'User',
          avatar,
          emailVerified: true,
          status: 'ACTIVE',
          roles: { connect: { name: 'CONSUMER' } },
          consumerProfile: {
            create: {
              accountNumber,
              address: 'TBD', city: 'TBD', state: 'TBD', zipCode: '00000',
            },
          },
        }) as any;
      }
    }

    if (user!.status !== 'ACTIVE') throw new AppError('Account is not active', 403);
    if (user!.lockoutUntil && user!.lockoutUntil > new Date()) throw new AppError(`Account locked`, 403);

    await authRepository.updateLastLogin(user!.id);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user!.id);

    await auditService.log(user!.id, 'LOGIN', 'auth', undefined, { method: 'google' }, reqInfo);
    logger.info(`User logged in via Google: ${user!.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: (user as any).roles?.[0]?.name || 'CONSUMER',
        avatar: user!.avatar,
        consumerProfile: (user as any).consumerProfile,
      },
    };
  }

  async sendPhoneOtp(phone: string) {
    if (!config.twilio.accountSid || !config.twilio.verifyServiceSid) {
      throw new AppError('Phone authentication is not configured', 501);
    }
    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    try {
      await client.verify.v2.services(config.twilio.verifyServiceSid)
        .verifications
        .create({ to: phone, channel: 'sms' });
      return { success: true, message: 'OTP sent successfully' };
    } catch (error: any) {
      logger.error(`Failed to send OTP to ${phone}: ${error.message}`);
      throw new AppError('Failed to send OTP. Please check the phone number.', 500);
    }
  }

  async verifyPhoneOtp(phone: string, code: string, reqInfo?: { ip?: string, userAgent?: string }) {
    if (!config.twilio.accountSid || !config.twilio.verifyServiceSid) {
      throw new AppError('Phone authentication is not configured', 501);
    }
    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    try {
      const verification = await client.verify.v2.services(config.twilio.verifyServiceSid)
        .verificationChecks
        .create({ to: phone, code });

      if (verification.status !== 'approved') {
        throw new AppError('Invalid OTP code', 400);
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(`Failed to verify OTP for ${phone}: ${error.message}`);
      throw new AppError('Invalid or expired OTP code', 400);
    }

    let user = await authRepository.findUserByPhone(phone);
    if (!user) {
      const accountNumber = `PG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      user = await authRepository.createUser({
        phone,
        authProvider: 'PHONE',
        phoneVerified: true,
        firstName: 'Phone',
        lastName: 'User',
        status: 'ACTIVE',
        roles: { connect: { name: 'CONSUMER' } },
        consumerProfile: {
          create: {
            accountNumber,
            address: 'TBD', city: 'TBD', state: 'TBD', zipCode: '00000',
          },
        },
      }) as any;
    } else if (!user.phoneVerified) {
       user = await prisma.user.update({
         where: { id: user.id },
         data: { phoneVerified: true },
         include: { roles: true, consumerProfile: true, utilityOfficer: true }
       }) as any;
    }

    if (user!.status !== 'ACTIVE') throw new AppError('Account is not active', 403);
    if (user!.lockoutUntil && user!.lockoutUntil > new Date()) throw new AppError(`Account locked`, 403);

    await authRepository.updateLastLogin(user!.id);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user!.id);

    await auditService.log(user!.id, 'LOGIN', 'auth', undefined, { method: 'phone' }, reqInfo);
    logger.info(`User logged in via Phone: ${user!.phone}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: (user as any).roles?.[0]?.name || 'CONSUMER',
        avatar: user!.avatar,
        consumerProfile: (user as any).consumerProfile,
      },
    };
  }

  async verifyEmailToken(token: string) {
    // Reuse the PasswordResetToken table for email verification tokens
    const resetToken = await authRepository.findPasswordResetToken(token);

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired email verification link', 400);
    }

    const userId = resetToken.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
    await authRepository.markPasswordResetTokenUsed(resetToken.id);

    await auditService.log(userId, 'EMAIL_VERIFIED', 'auth');
    logger.info(`Email verified for user: ${userId}`);

    return { success: true, message: 'Email verified successfully' };
  }

  private generateAccessToken(user: any) {

    return jwt.sign(
      { id: user.id, email: user.email, role: user.roles?.[0]?.name || 'CONSUMER' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await authRepository.createRefreshToken(token, userId, expiresAt);

    return token;
  }
}

export const authService = new AuthService();
