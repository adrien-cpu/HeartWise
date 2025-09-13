/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * @module i18nSettings
 * @description Simplified i18n configuration for the application.
 */

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en' as const;

export const localePrefix = 'as-needed';

export const pathnames = {
  '/': '/',
  '/game': '/game',
  '/speed-dating': '/speed-dating',
  '/geolocation-meeting': '/geolocation-meeting',
  '/facial-analysis-matching': '/facial-analysis-matching',
  '/ai-conversation-coach': '/ai-conversation-coach',
  '/blind-exchange-mode': '/blind-exchange-mode',
  '/chat': '/chat',
  '/login': '/login',
  '/signup': '/signup',
  '/profile': '/profile',
  '/dashboard': '/dashboard',
} as const;

/**
 * Checks if the provided locale string is a valid and supported locale.
 * @param {string} locale - The locale string to validate.
 * @returns {locale is Locale} True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: string | undefined): locale is Locale {
  return typeof locale === 'string' && locales.includes(locale as Locale);
}