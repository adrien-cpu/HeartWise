
/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * This file primarily defines constants used by both the middleware and the main i18n config.
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
  '/rewards': '/rewards', // Added rewards pathname
  // Add other paths as needed
} satisfies Record<string, string>; // Use 'satisfies' for type checking without changing the type

/**
 * Checks if the provided locale string is a valid and supported locale.
 * @param {string} locale - The locale string to validate.
 * @returns {boolean} True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as any);
}
