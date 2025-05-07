
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix, defaultLocale, pathnames } from '@/i18n/settings';

/**
 * @fileOverview Middleware for handling internationalization (i18n) routing.
 * @module Middleware
 * @description This middleware uses `next-intl` to manage locale detection and prefixing in routes.
 * It ensures that requests are correctly routed based on the detected or specified locale.
 * It uses the configuration defined in `i18n/settings.ts`.
 *
 * @see https://next-intl.dev/docs/routing/middleware
 */
export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // The prefixing strategy
  localePrefix,

  // Pathnames for internationalized routing (optional but recommended for complex apps)
  // If you have specific path translations, define them in settings.ts
  // e.g., pathnames: { '/about': { en: '/about-us', fr: '/a-propos' } }
  pathnames,
});

/**
 * Configuration object for the Next.js middleware.
 *
 * @description Defines which paths the middleware should apply to.
 * It includes paths for core application functionality and excludes paths typically used for static assets or API routes.
 *
 * @property {string[]} matcher - An array of path patterns to match.
 */
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Optional: Match all pathnames within specific directories if needed, e.g.,
    // '/(en|fr)/users/:path*'
  ]
};
