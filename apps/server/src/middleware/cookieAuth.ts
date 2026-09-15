import { Response, CookieOptions } from 'express';
import config from '../config';

// ─────────────────────────────────────────────────────────
// Cookie names
// ─────────────────────────────────────────────────────────
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// ─────────────────────────────────────────────────────────
// Base cookie options from config
// ─────────────────────────────────────────────────────────
const baseCookieOptions: CookieOptions = {
  httpOnly: config.cookie.httpOnly,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: config.cookie.path,
  ...(config.cookie.domain && { domain: config.cookie.domain }),
};

/**
 * Set both access_token and refresh_token as HttpOnly cookies.
 * Called after successful login, register, and token refresh.
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: config.cookie.accessTokenMaxAge,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: config.cookie.refreshTokenMaxAge,
  });
}

/**
 * Clear both authentication cookies.
 * Called during logout and when refresh token is invalid/expired.
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: baseCookieOptions.httpOnly,
    secure: baseCookieOptions.secure,
    sameSite: baseCookieOptions.sameSite,
    path: baseCookieOptions.path,
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: baseCookieOptions.httpOnly,
    secure: baseCookieOptions.secure,
    sameSite: baseCookieOptions.sameSite,
    path: baseCookieOptions.path,
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  });
}
