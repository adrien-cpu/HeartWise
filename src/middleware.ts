import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames } from '@/i18n/settings';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
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

// Routes publiques
const publicRoutes = ['/login', '/signup'];

// Créer le middleware d'internationalisation
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});

export default async function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est authentifié
  const authToken = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Extraire le chemin sans la locale
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  // Si la route est protégée et l'utilisateur n'est pas authentifié
  if (isProtectedRoute && !authToken) {
    const locale = request.nextUrl.pathname.split('/')[1];
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est authentifié et essaie d'accéder aux routes de connexion/inscription
  if (authToken && isPublicRoute) {
    const locale = request.nextUrl.pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Appliquer le middleware d'internationalisation
  return intlMiddleware(request);
}

/**
 * Configuration du middleware Next.js.
 * Définit les chemins auxquels le middleware doit s'appliquer.
 */
export const config = {
  matcher: [
    // Appliquer à tous les chemins sauf :
    // - api, _next, _vercel
    // - fichiers statiques (avec extension)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
