
/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * This file defines supported locales, default locale, pathnames, and provides
 * the configuration function for next-intl.
 */

import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, pathnames, isValidLocale} from '@/i18n/settings'; // Import from settings

/**
 * Configuration function for next-intl.
 * It validates the locale and fetches the corresponding messages.
 * Handles cases where the initial locale might be invalid or undefined before middleware redirection.
 *
 * @param {object} params - The parameters object.
 * @param {string} params.locale - The current locale provided by the middleware or URL.
 * @returns {Promise<object>} The configuration object with messages for the specified or default locale.
 * @throws {Error} If the messages file for the default locale cannot be loaded.
 */
export default getRequestConfig(async ({locale}) => {
  // Determine the locale to use: the provided one if valid, otherwise the default.
  // The middleware should ensure a valid locale reaches here eventually via redirection.
  const resolvedLocale = isValidLocale(locale) ? locale : defaultLocale;

  // Log if the provided locale was invalid/undefined, but proceed with default.
  if (!isValidLocale(locale)) {
    console.warn(`i18n.ts: Invalid or undefined locale "${locale}" detected. Using default locale "${defaultLocale}". Middleware should handle redirection.`);
    // It's generally better NOT to call notFound() here directly.
    // Let the middleware handle the redirection to the correct locale path.
    // If this function is called *after* middleware redirection with an invalid locale,
    // then notFound() might be appropriate, but the primary check handles fallback.
  }

  let messages;
  try {
    // Load messages for the *resolved* locale (either valid requested or default)
    messages = (await import(`./src/messages/${resolvedLocale}.json`)).default;
  } catch (error) {
    // Log error if messages for the resolved locale fail
    console.error(`Could not load messages for locale: ${resolvedLocale}`, error);

    // If the resolved locale *was* the default and it failed, it's critical.
    if (resolvedLocale === defaultLocale) {
         throw new Error(`Failed to load default locale messages ("${defaultLocale}"). Please check if the file exists and is valid.`);
    }

    // If the resolved locale wasn't the default, attempt to load default messages as a final fallback.
    try {
         console.warn(`Falling back to default locale messages (${defaultLocale}) because messages for "${resolvedLocale}" failed to load.`);
         messages = (await import(`./src/messages/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
         // If even the default messages fail, throw a comprehensive error.
         console.error(`Could not load default messages for locale: ${defaultLocale}`, fallbackError);
         throw new Error(`Failed to load messages for originally requested locale "${locale}" and also failed to load default locale "${defaultLocale}".`);
    }
  }

  // Return messages for the resolved locale (or default if resolved failed but default succeeded).
  return {
    messages
  };
});
