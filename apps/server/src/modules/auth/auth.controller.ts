import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/authenticate';
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from '../../middleware/cookieAuth';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Set HttpOnly auth cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      // Return user data only — tokens are in HttpOnly cookies, not the response body
      res.json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Set HttpOnly auth cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      // Return user data only
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Read refresh token from HttpOnly cookie
      const refreshTokenStr = req.cookies?.[REFRESH_TOKEN_COOKIE];

      if (!refreshTokenStr) {
        clearAuthCookies(res);
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshAccessToken(refreshTokenStr);

      // Set new rotated cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.json({ success: true, message: 'Token refreshed' });
    } catch (error) {
      // Clear cookies on refresh failure (expired/invalid/revoked)
      clearAuthCookies(res);
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Read refresh token from cookie for targeted revocation
      const refreshTokenStr = req.cookies?.[REFRESH_TOKEN_COOKIE];
      await authService.logout(req.user!.id, refreshTokenStr);

      // Clear all auth cookies
      clearAuthCookies(res);

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      // Always clear cookies even if logout service fails
      clearAuthCookies(res);
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.googleLogin(req.body.idToken, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendPhoneOtp(req.body.phone);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyPhoneOtp(req.body.phone, req.body.code, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmailToken(req.body.token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    // Alias for getProfile — some clients use /me convention
    return this.getProfile(req, res, next);
  }
}

export const authController = new AuthController();
