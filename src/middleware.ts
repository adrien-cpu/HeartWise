import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames } from '@/i18n/settings';
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

const testRoutes = ['/test-css', '/test-simple', '/debug', '/tailwind-test'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚫 Autorise les routes de test sans locale
  if (testRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ Autorise l'accès à la page racine sans locale
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 🔁 Si aucune locale détectée dans l’URL, redirige vers /[defaultLocale]/...
  const pathHasLocale = locales.some(locale =>
    pathname.startsWith(`/${locale}`)
  );

  if (!pathHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 🍪 Authentification
  const authToken = request.cookies.get('auth-token')?.value;

  // 🧹 Extrait le chemin sans locale
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');

  const isProtected = protectedRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  const isPublic = publicRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  const locale = pathname.split('/')[1]; // Sûr car vérifié plus haut

  // 🔒 Redirige vers login si route protégée et pas connecté
  if (isProtected && !authToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔄 Redirige utilisateur connecté hors de login/signup
  if (authToken && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 🌍 Applique l’internationalisation
  return intlMiddleware(request);
}

/**
 * ⚙️ Configuration des routes traitées par le middleware
 */
export const config = {
  matcher: [
    '/((?!_next|.*\\.css$|.*\\.js$|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.json$|.*\\.txt$).*)',
  ],
};
