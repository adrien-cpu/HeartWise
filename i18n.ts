/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * This file defines supported locales, default locale, pathnames, and provides
 * the configuration function for next-intl. It runs on the server.
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, pathnames, isValidLocale } from './src/i18n/settings'; // Adjust path if needed

/**
 * Configuration function for next-intl.
 * It validates the locale and fetches the corresponding messages.
 * If messages for the requested locale cannot be loaded, it attempts to fall back to the default locale.
 * The 'locale' property in the returned object will reflect the locale for which messages were actually successfully loaded.
 *
 * @param {object} params - The parameters object.
 * @param {string} params.locale - The current locale provided by the middleware or URL.
 * @returns {Promise<object>} The configuration object with messages and the effective locale for those messages.
 * @throws {Error} If essential messages (like default locale) cannot be loaded or are invalid.
 */
export default getRequestConfig(async ({ locale: rawLocale }) => {
  let determinedLocale = (typeof rawLocale === 'string' && isValidLocale(rawLocale)) ? rawLocale : defaultLocale;
  let messagesToUse;

  if (typeof rawLocale !== 'string' || !isValidLocale(rawLocale)) {
    console.warn(`i18n.ts: Invalid or undefined locale "${rawLocale ?? 'undefined'}" detected. Using default locale "${determinedLocale}". Middleware should handle redirection.`);
  }

  try {
    messagesToUse = (await import(`./src/messages/${determinedLocale}.json`)).default;
    if (!messagesToUse || typeof messagesToUse !== 'object' || Object.keys(messagesToUse).length === 0) {
      console.error(`Loaded empty or invalid messages for locale: ${determinedLocale} in i18n.ts.`);
      // Trigger fallback by throwing, will be caught below
      throw new Error(`Empty/invalid messages for ${determinedLocale}.`);
    }
  } catch (error) {
    // This catch block handles failure to load messages for 'determinedLocale'
    console.warn(`i18n.ts: Failed to load messages for locale "${determinedLocale}". Attempting fallback to default locale "${defaultLocale}". Error: ${error instanceof Error ? error.message : String(error)}`);
    if (determinedLocale !== defaultLocale) {
      try {
        messagesToUse = (await import(`./src/messages/${defaultLocale}.json`)).default;
        if (!messagesToUse || typeof messagesToUse !== 'object' || Object.keys(messagesToUse).length === 0) {
          console.error(`Fallback default locale messages ("${defaultLocale}") are also missing, empty, or invalid in i18n.ts.`);
          throw new Error(`Critical: Default locale messages ("${defaultLocale}") also failed to load or are invalid.`);
        }
        determinedLocale = defaultLocale; // IMPORTANT: Update determinedLocale because we are now using default locale's messages
      } catch (fallbackError) {
        console.error(`Critical error: Failed to load fallback default locale messages ("${defaultLocale}") in i18n.ts: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        messagesToUse = {}; // Ultimate fallback: empty messages to prevent app crash
        // determinedLocale remains what it was (either original rawLocale if valid, or defaultLocale if rawLocale was invalid)
        // This means provider might get initialized with a locale but empty messages if default also fails.
      }
    } else {
      // This means the original determinedLocale was already defaultLocale, and it failed to load.
      console.error(`Critical error: Default locale messages ("${defaultLocale}") are missing, empty, or invalid in i18n.ts.`);
      messagesToUse = {}; // Ultimate fallback: empty messages
    }
  }

  return {
    locale: determinedLocale, // This is the locale for which messages (messagesToUse) are being returned.
    messages: messagesToUse
  };
});
