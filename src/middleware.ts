import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, pathnames, localePrefix } from './i18n/settings';

// List of protected and public routes
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

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Create a regex to match the locales in the path
  const localePattern = `^/(${locales.join('|')})`;
  const localeRegex = new RegExp(localePattern);

  // Get the pathname without the locale prefix
  let pathnameWithoutLocale = pathname.replace(localeRegex, '');
  if (pathnameWithoutLocale === '') {
    pathnameWithoutLocale = '/';
  } else if (pathnameWithoutLocale.startsWith('/')) {
    // No change needed
  }
  else {
    pathnameWithoutLocale = `/${pathnameWithoutLocale}`;
  }
  
  // Check for authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Redirect to login if trying to access a protected route without being authenticated
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public routes like login/signup
  if (authToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If authentication checks pass, proceed with the i18n middleware
  const handleI18nRouting = createIntlMiddleware({
    locales,
    defaultLocale,
    pathnames,
    localePrefix,
  });

  const response = handleI18nRouting(request);

  return response;
}

export const config = {
  // Match all routes except for static files, API routes, and specific image formats.
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|favicon.ico).*)'
  ],
};
