/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * @module i18nSettings
 * @description This file defines constants used by the middleware and the main i18n config.
 *              It also provides the getRequestConfig function for next-intl.
 *              This file is intended to be the single source of truth for i18n setup when used with next-intl/plugin.
 */

import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';

// Static imports for message files
// The path is relative to this file (src/i18n/settings.ts).
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';

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

// Main configuration logic for next-intl
export default getRequestConfig(async ({ locale: rawLocale }) => {
  let determinedLocale: Locale;

  if (isValidLocale(rawLocale)) {
    determinedLocale = rawLocale;
  } else {
    console.warn(`[i18n-config] Invalid or undefined rawLocale "${rawLocale ?? 'undefined'}" received by getRequestConfig. Using default locale "${defaultLocale}". This might indicate an issue with middleware or URL structure.`);
    determinedLocale = defaultLocale;
  }

  let messages: AbstractIntlMessages;
  try {
    switch (determinedLocale) {
      case 'en':
        messages = enMessages;
        break;
      case 'fr':
        messages = frMessages;
        break;
      default:
        console.error(`[i18n-config] CRITICAL: Reached default case in message loading for locale: "${determinedLocale}". This should not happen. Loading English messages as a last resort.`);
        messages = enMessages;
        determinedLocale = 'en';
        break;
    }

    // Validate messages structure
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      throw new Error(`Messages for locale "${determinedLocale}" are empty or invalid`);
    }

    // Ensure Auth section exists
    if (!messages.Auth) {
      throw new Error(`Auth section missing in messages for locale "${determinedLocale}"`);
    }

    return {
      locale: determinedLocale,
      messages,
    };
  } catch (error) {
    console.error(`[i18n-config] Error loading messages for locale "${determinedLocale}":`, error);
    return {
      locale: determinedLocale,
      messages: {},
    };
  }
});
