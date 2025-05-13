
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
  '/forgot-password': '/forgot-password',
} as const;

/**
 * Checks if the provided locale string is a valid and supported locale.
 * @param {any} rawLocale - The locale string to validate.
 * @returns {rawLocale is Locale} True if the locale is valid, false otherwise.
 */
export function isValidLocale(rawLocale: any): rawLocale is Locale {
  return locales.includes(rawLocale);
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
  switch (determinedLocale) {
    case 'en':
      messages = enMessages as AbstractIntlMessages;
      break;
    case 'fr':
      messages = frMessages as AbstractIntlMessages;
      break;
    default:
      // This case should ideally not be reached if determinedLocale is correctly typed and defaulted.
      // However, as a safeguard:
      console.error(`[i18n-config] CRITICAL: Reached default case in message loading for locale: "${determinedLocale}". This should not happen. Loading English messages as a last resort.`);
      messages = enMessages as AbstractIntlMessages;
      // It's important that the locale returned matches the messages loaded.
      // If we load 'en' messages, we should return 'en' as the locale.
      determinedLocale = 'en';
      break;
  }
  
  // Additional check for empty or invalid messages object
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`[i18n-config] Statically imported messages for locale "${determinedLocale}" are empty or invalid. Check the JSON file and import path. Using empty messages for client.`);
    // Return the locale we attempted to load, but with empty messages to prevent full crash.
    // The application will likely show missing translation warnings.
    return {
      locale: determinedLocale,
      messages: {}, 
    };
  }
  
  return {
    locale: determinedLocale,
    messages: messages,
  };
});
