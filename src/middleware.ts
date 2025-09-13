import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/profile',
  '/game',
  '/speed-dating',
  '/geolocation-meeting',
  '/facial-analysis-matching',
  '/ai-conversation-coach',
  '/blind-exchange-mode',
  '/chat',
  '/risky-words-dictionary',
  '/rewards',
  '/dashboard',
];

const publicRoutes = ['/login', '/signup'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow test routes without restrictions
  if (pathname.startsWith('/test-') || pathname.startsWith('/debug')) {
    return NextResponse.next();
  }

  // Allow access to home page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check authentication
  const authToken = request.cookies.get('auth-token')?.value;

  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isPublic = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect to login if protected route and not authenticated
  if (isProtected && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from login/signup
  if (authToken && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|.*\\.css$|.*\\.js$|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.json$|.*\\.txt$).*)',
  ],
};