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
export default getRequestConfig(async ({ locale }) => {
  // Use the provided locale if valid, otherwise default to `defaultLocale`.
  // Middleware should ensure this is usually valid by the time it reaches here.
  const resolvedLocale = isValidLocale(locale) ? locale : defaultLocale;

  // Log if the provided locale was invalid/undefined, but proceed with the default.
  // Middleware is the primary place to handle redirection for invalid locales.
  if (!isValidLocale(locale)) {
    console.warn(`i18n.ts: Invalid or undefined locale "${locale}" detected. Using default locale "${resolvedLocale}". Middleware should handle redirection.`);
    // Do NOT call notFound() here. Let the middleware redirect or RootLayout handle it.
  }

  let messages;
  try {
    // Dynamically import the messages for the resolved locale.
    // The path is relative to the location of this i18n.ts file.
    messages = (await import(`./src/messages/${resolvedLocale}.json`)).default;

    // Basic validation: Check if messages were loaded and are not empty.
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`Loaded empty or invalid messages for locale: ${resolvedLocale}. Check the JSON file.`);
      // If the default locale itself failed, throw a critical error.
      if (resolvedLocale === defaultLocale) {
        throw new Error(`Default locale messages ("${defaultLocale}") are missing, empty, or invalid.`);
      }
      // Attempt to fall back to default locale messages if the requested one failed.
      console.warn(`Falling back to default locale messages (${defaultLocale}).`);
      messages = (await import(`./src/messages/${defaultLocale}.json`)).default;
      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        throw new Error(`Fallback default locale messages ("${defaultLocale}") are also missing, empty, or invalid.`);
      }
    }
  } catch (error: any) {
    console.error(`Failed to load messages for locale "${resolvedLocale}" (or fallback):`, error.message);
    // If message loading fails critically (even fallback), we might need to signal an error.
    // Throwing here ensures the problem is surfaced.
     throw new Error(`Failed to load essential translation messages for locale "${resolvedLocale}" or default locale "${defaultLocale}". Error: ${error.message}`);
     // Alternatively, could return minimal default messages or trigger notFound(),
     // but throwing makes the configuration issue clear.
     // Note: Calling notFound() here might not be ideal if RootLayout also tries to handle it.
  }

  // Return the locale and messages for the client provider.
  return {
    locale: resolvedLocale, // Crucial: Ensure locale is part of the returned object
    messages
  };
});
