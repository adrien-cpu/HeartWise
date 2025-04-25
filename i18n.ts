
/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * This file defines supported locales, default locale, pathnames, and provides
 * the configuration function for next-intl.
 */

import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, pathnames} from '@/i18n/settings'; // Import from settings

/**
 * Configuration function for next-intl.
 * It validates the locale and fetches the corresponding messages.
 *
 * @param {object} params - The parameters object.
 * @param {string} params.locale - The current locale provided by the middleware.
 * @returns {Promise<object>} The configuration object with messages for the specified locale.
 * @throws {Error} If the messages file for the locale cannot be loaded.
 */
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`Invalid locale detected: ${locale}. Redirecting to default: ${defaultLocale}`);
    // Use notFound() here as per next-intl docs for invalid locales in server components/config
    notFound();
  }

  let messages;
  try {
    // Dynamically import the messages for the requested locale
    // Assumes messages are in src/messages/
    messages = (await import(`./src/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    // Attempt to load default locale messages as a fallback, or handle error appropriately
    try {
        messages = (await import(`./src/messages/${defaultLocale}.json`)).default;
        console.warn(`Falling back to default locale messages (${defaultLocale}) for locale: ${locale}`);
    } catch (fallbackError) {
        console.error(`Could not load default messages for locale: ${defaultLocale}`, fallbackError);
        // If default messages also fail, throw an error or return empty messages
        throw new Error(`Failed to load messages for locale "${locale}" and default locale "${defaultLocale}".`);
    }
  }

  return {
    messages
  };
});
