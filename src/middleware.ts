import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/settings';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
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

// Public routes
const publicRoutes = ['/login', '/signup', '/forgot-password'];

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Check if the path is for static files or API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Apply the internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except for:
  // - API routes
  // - /_next (Next.js internals)
  // - /static (static files)
  // - Files with extensions (e.g. favicon.ico)
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
};