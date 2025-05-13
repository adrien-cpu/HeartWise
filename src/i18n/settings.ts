
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
// Assuming messages/en.json and messages/fr.json are at src/messages.
// The path is relative to this file (src/i18n/settings.ts).
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';

export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const localePrefix = 'as-needed';

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
} as const;

/**
 * Checks if the provided locale string is a valid and supported locale.
 * @param {any} locale - The locale string to validate.
 * @returns {locale is Locale} True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: any): locale is Locale {
  return locales.includes(locale);
}

// Main configuration logic for next-intl
export default getRequestConfig(async ({ locale: rawLocale }) => {
  let determinedLocale: Locale;

  if (isValidLocale(rawLocale)) {
    determinedLocale = rawLocale;
  } else {
    // This console log is helpful for debugging middleware or routing issues.
    console.warn(`[i18n-config] Invalid or undefined rawLocale "${rawLocale ?? 'undefined'}" received. Using default locale "${defaultLocale}".`);
    determinedLocale = defaultLocale;
  }

  let messages: AbstractIntlMessages;
  switch (determinedLocale) {
    case 'en':
      messages = enMessages as AbstractIntlMessages;
      break;
    case 'fr':
      messages = frMessages as AbstractIntlMessages;
      break;
    default:
      // This case should not be reached if determinedLocale is correctly typed and defaulted.
      console.warn(`[i18n-config] Fallback to English messages for an unexpected locale: ${determinedLocale}`);
      messages = enMessages as AbstractIntlMessages;
      determinedLocale = 'en'; // Ensure determinedLocale is set to what messages are loaded for
      break;
  }

  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`[i18n-config] Statically imported messages for locale: "${determinedLocale}" are empty or invalid. This indicates a problem with the JSON file itself or the import.`);
    // Fallback to an empty object for messages to prevent app crash,
    // and ensure the locale reflects this empty state (or the default).
    return {
      locale: determinedLocale, // Return the locale we attempted, even if messages are empty
      messages: {},
    };
  }
  
  return {
    locale: determinedLocale,
    messages: messages,
  };
});

