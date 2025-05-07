/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * @module i18nSettings
 * @description This file primarily defines constants used by both the middleware and the main i18n config (`i18n.ts`).
 *              It should not contain any client-side specific code or directives.
 */

// Define the supported locales
export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];

// Define the default locale
export const defaultLocale: Locale = 'en';

// Define the prefixing strategy for locales in the URL
export const localePrefix = 'as-needed'; // Options: 'always', 'never', 'as-needed'

// Define pathnames for internationalized routing (optional)
// Make sure these paths align with your actual application routes
// If you have localized pathnames, you would define them here, e.g.:
// export const pathnames = {
//   '/': '/',
//   '/about': {
//     en: '/about-us',
//     fr: '/a-propos'
//   }
// } satisfies Pathnames<typeof locales>;
// For now, keeping simple pathnames.
export const pathnames = {
  '/': '/',
  '/profile': '/profile',
  '/game': '/game',
  '/speed-dating': '/speed-dating',
  '/geolocation-meeting': '/geolocation-meeting',
  '/facial-analysis-matching': '/facial-analysis-matching',
  '/ai-conversation-coach': '/ai-conversation-coach',
  '/blind-exchange-mode': '/blind-exchange-mode',
  '/chat': '/chat',
  '/risky-words-dictionary': '/risky-words-dictionary',
  '/rewards': '/rewards',
  '/dashboard': '/dashboard',
  '/login': '/login',
  '/signup': '/signup',
} as const; // Using simple string paths for now, not localized path objects.

/**
 * Checks if the provided locale string is a valid and supported locale.
 * @param {string} locale - The locale string to validate.
 * @returns {locale is Locale} True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// The `getRequestConfig` function for next-intl should be in `i18n.ts` at the root, not here.
// This file is for settings shared between middleware and the main config.
