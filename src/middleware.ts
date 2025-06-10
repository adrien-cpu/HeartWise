import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames } from '@/i18n/settings';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});

export default async function middleware(request: NextRequest) {
  // Apply the internationalization middleware
  return intlMiddleware(request);
}

/**
 * Configuration for the middleware Next.js.
 * Defines the paths to which the middleware should be applied.
 */
export const config = {
  matcher: [
    // Apply to all paths except:
    // - api, _next, _vercel
    // - static files (with extension)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};