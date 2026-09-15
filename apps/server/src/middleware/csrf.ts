import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import config from '../config';
import logger from '../config/logger';

// ─────────────────────────────────────────────────────────
// CSRF Protection — Double-Submit Cookie Pattern
// ─────────────────────────────────────────────────────────
// How it works:
// 1. GET /api/auth/csrf-token sets a `csrf_token` cookie (NOT HttpOnly)
//    and returns the token in the response body.
// 2. The frontend reads the token and includes it in the
//    `X-CSRF-Token` header on state-changing requests (POST/PUT/DELETE/PATCH).
// 3. This middleware validates that the header matches the cookie.
// ─────────────────────────────────────────────────────────

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token.
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Route handler: GET /api/auth/csrf-token
 * Sets the CSRF cookie and returns the token.
 */
export function csrfTokenHandler(_req: Request, res: Response): void {
  const token = generateCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,    // Frontend must read this cookie
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  });

  res.json({ csrfToken: token });
}

/**
 * Middleware: Validate CSRF token on state-changing requests.
 * Only applies to POST, PUT, DELETE, PATCH methods.
 * Skips validation for unauthenticated endpoints (login, register).
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  // Only validate state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF validation failed: missing token', {
      path: req.path,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });
    res.status(403).json({ error: 'CSRF token missing' });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  const cookieBuf = Buffer.from(cookieToken);
  const headerBuf = Buffer.from(headerToken);

  if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    logger.warn('CSRF validation failed: token mismatch', { path: req.path });
    res.status(403).json({ error: 'CSRF token invalid' });
    return;
  }

  next();
}
