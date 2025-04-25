
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix, defaultLocale, pathnames } from '@/i18n/settings'; // Keep importing settings from src

/**
 * Middleware for handling internationalization (i18n) routing.
 *
 * @description This middleware uses `next-intl` to manage locale detection and prefixing in routes.
 * It ensures that requests are correctly routed based on the detected or specified locale.
 * It uses the configuration defined in `i18n.ts` (at the root).
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

  // Pathnames for internationalized routing (optional)
  pathnames,

  // The file where the configuration is defined
  // This explicitly tells next-intl where to find the config
  // Adjust if your config file is named differently or located elsewhere relative to root
  pathnames // Already defined in settings, re-using here for clarity
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
