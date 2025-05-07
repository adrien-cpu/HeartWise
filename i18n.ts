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
 * Handles cases where the initial locale might be invalid or undefined before middleware redirection.
 *
 * @param {object} params - The parameters object.
 * @param {string} params.locale - The current locale provided by the middleware or URL.
 * @returns {Promise<object>} The configuration object with messages and locale for the specified or default locale.
 * @throws {Error} If the messages file for the default locale cannot be loaded or is invalid.
 */
export default getRequestConfig(async ({ locale: rawLocale }) => {
  // Ensure locale is a valid string, defaulting to defaultLocale if not.
  const locale = (typeof rawLocale === 'string' && isValidLocale(rawLocale)) ? rawLocale : defaultLocale;

  // Log if the provided rawLocale was invalid/undefined, but proceed with the determined locale.
  if (typeof rawLocale !== 'string' || !isValidLocale(rawLocale)) {
    console.warn(`i18n.ts: Invalid or undefined locale "${rawLocale ?? 'undefined'}" detected. Using default locale "${locale}". Middleware should handle redirection.`);
  }

  let messages;
  try {
    messages = (await import(`./src/messages/${locale}.json`)).default;

    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`Loaded empty or invalid messages for locale: ${locale}. Check the JSON file.`);
      if (locale === defaultLocale) {
        throw new Error(`Default locale messages ("${defaultLocale}") are missing, empty, or invalid.`);
      }
      console.warn(`Falling back to default locale messages (${defaultLocale}).`);
      messages = (await import(`./src/messages/${defaultLocale}.json`)).default;
      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        throw new Error(`Fallback default locale messages ("${defaultLocale}") are also missing, empty, or invalid.`);
      }
    }
  } catch (error: any) {
    console.error(`Failed to load messages for locale "${locale}" (or fallback):`, error.message);
     throw new Error(`Failed to load essential translation messages for locale "${locale}" or default locale "${defaultLocale}". Error: ${error.message}`);
  }

  return {
    locale: locale,
    messages
  };
});
