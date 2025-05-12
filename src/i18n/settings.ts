/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * @module i18nSettings
 * @description This file defines constants used by the middleware and the main i18n config.
 *              It also provides the getRequestConfig function for next-intl.
 *              This file is intended to be the single source of truth for i18n setup when used with next-intl/plugin.
 */

import { getRequestConfig } from 'next-intl/server';
// import { notFound } from 'next/navigation'; // notFound should not be called from getRequestConfig directly if it causes issues in RootLayout

// Define and export constants directly in this file
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
 * @param {string} locale - The locale string to validate.
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

  let messages;
  try {
    // Path is relative to this file (src/i18n/settings.ts)
    messages = (await import(`../../messages/${determinedLocale}.json`)).default;
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      // This indicates that the message file was found but is empty or malformed.
      console.error(`[i18n-config] Loaded empty or invalid messages for locale: ${determinedLocale}.`);
      throw new Error(`Empty/invalid messages for ${determinedLocale}.`);
    }
  } catch (error) {
    // This catch block handles failure to load messages for 'determinedLocale' (e.g., file not found, JSON parse error)
    console.error(`[i18n-config] Failed to load messages for locale "${determinedLocale}". Attempting fallback to default locale "${defaultLocale}". Error: ${error instanceof Error ? error.message : String(error)}`);
    if (determinedLocale !== defaultLocale) {
      try {
        messages = (await import(`../../messages/${defaultLocale}.json`)).default;
        if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
          console.error(`[i18n-config] CRITICAL: Default locale messages ("${defaultLocale}") are also missing, empty, or invalid after fallback attempt.`);
          throw new Error(`Critical: Default locale messages ("${defaultLocale}") also failed to load or are invalid.`);
        }
        determinedLocale = defaultLocale; // Update determinedLocale as we are now using default's messages
        console.log(`[i18n-config] Successfully loaded fallback messages for "${determinedLocale}".`);
      } catch (fallbackError) {
        console.error(`[i18n-config] CRITICAL ERROR: Failed to load fallback default locale messages ("${defaultLocale}"): ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        messages = {}; // Ultimate fallback: empty messages to prevent app crash
      }
    } else {
      // This means the original determinedLocale was already defaultLocale, and it failed to load.
      console.error(`[i18n-config] CRITICAL ERROR: Default locale messages ("${defaultLocale}") are missing, empty, or invalid.`);
      messages = {};
    }
  }

  // Final safety check on determinedLocale before returning.
  // This ensures that the 'locale' field in the returned object is always a valid 'en' or 'fr'.
  if (!isValidLocale(determinedLocale)) {
    console.error(`[i18n-config] determinedLocale ("${determinedLocale}") became invalid before returning. This indicates a severe logic flaw. Forcing to defaultLocale ("${defaultLocale}").`);
    determinedLocale = defaultLocale;
  }

  return {
    locale: determinedLocale, // This is the locale for which messages are being returned.
    messages: messages
  };
});
