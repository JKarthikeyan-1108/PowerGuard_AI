import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

// Role-based route mapping — where each role's dashboard lives
const ROLE_ROUTES: Record<string, string> = {
  CONSUMER: '/consumer',
  UTILITY_OFFICER: '/utility',
  ADMIN: '/admin',
  SUPER_ADMIN: '/super-admin',
};

// Role hierarchy for access control
// Higher index = more privileged
const ROLE_HIERARCHY: Record<string, number> = {
  CONSUMER: 1,
  UTILITY_OFFICER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

// Route prefixes and the minimum role level required
const PROTECTED_ROUTE_LEVELS: { prefix: string; minLevel: number }[] = [
  { prefix: '/admin', minLevel: 3 },          // Admin only
  { prefix: '/utility', minLevel: 2 },         // Utility + Admin
  { prefix: '/consumer', minLevel: 1 },        // Consumer + Utility + Admin
];

/**
 * Decode a JWT payload without verification.
 * The backend independently verifies the token — this is only for
 * routing hints in the middleware edge runtime.
 */
function decodeJwtPayload(token: string): { id: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64url decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read access_token from HttpOnly cookie
  const accessToken = request.cookies.get('access_token')?.value;
  let session: { role: string; userId: string; exp: number } | null = null;

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload && payload.exp) {
      // Check if token is expired (exp is in seconds)
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp > now) {
        session = {
          role: payload.role,
          userId: payload.id,
          exp: payload.exp,
        };
      }
    }
  }

  const isAuthenticated = !!session;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // Unauthenticated user trying to access protected routes
  if (!isAuthenticated && !isPublicPath && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting login/register → redirect to their dashboard
  if (isAuthenticated && isPublicPath) {
    const dashboardUrl = new URL(ROLE_ROUTES[session!.role] || '/consumer', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Root path → redirect based on auth state
  if (pathname === '/') {
    if (isAuthenticated) {
      const dashboardUrl = new URL(ROLE_ROUTES[session!.role] || '/consumer', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control for dashboard routes
  if (isAuthenticated && session) {
    const userLevel = ROLE_HIERARCHY[session.role] || 0;

    for (const { prefix, minLevel } of PROTECTED_ROUTE_LEVELS) {
      if (pathname.startsWith(prefix)) {
        if (userLevel < minLevel) {
          // Insufficient privileges → redirect to user's own dashboard
          const correctDashboard = new URL(ROLE_ROUTES[session.role] || '/consumer', request.url);
          return NextResponse.redirect(correctDashboard);
        }
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
