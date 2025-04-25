
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix, defaultLocale } from './i18n/settings';

/**
 * Middleware for handling internationalization (i18n) routing.
 *
 * @description This middleware uses `next-intl` to manage locale detection and prefixing in routes.
 * It ensures that requests are correctly routed based on the detected or specified locale.
 *
 * @see https://next-intl.dev/docs/routing/middleware
 */
export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // The prefixing strategy
  localePrefix
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
    // Match all pathnames within `/users`, optionally including a locale prefix
     //'/([\\w-]+)?/users/(.+)' // Uncomment if you have user-specific routes that need locale handling
  ]
};
