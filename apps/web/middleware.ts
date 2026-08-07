import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

// Role-based route mapping
const ROLE_ROUTES: Record<string, string> = {
  CONSUMER: '/consumer',
  UTILITY_OFFICER: '/utility',
  ADMIN: '/admin',
};

const ROLE_ALLOWED_PATHS: Record<string, string> = {
  '/consumer': 'CONSUMER',
  '/utility': 'UTILITY_OFFICER',
  '/admin': 'ADMIN',
};

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

  // Read session cookie (set by client after login)
  const sessionCookie = request.cookies.get('powerguard-session')?.value;
  let session: { role: string; userId: string } | null = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie);
    } catch {
      // Invalid cookie — treat as unauthenticated
      session = null;
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
    for (const [routePrefix, requiredRole] of Object.entries(ROLE_ALLOWED_PATHS)) {
      if (pathname.startsWith(routePrefix)) {
        if (session.role !== requiredRole) {
          // Wrong role → redirect to correct dashboard
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
