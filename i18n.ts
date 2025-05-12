/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 * This file defines supported locales, default locale, pathnames, and provides
 * the configuration function for next-intl. It runs on the server.
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { 
  type Locale,
  locales as supportedLocales, // Renamed for clarity inside this file
  defaultLocale as importedDefaultLocale, 
  pathnames, 
  isValidLocale 
} from './src/i18n/settings'; // Adjust path if needed

// Defensive check for importedDefaultLocale
const effectiveDefaultLocale: Locale = (importedDefaultLocale && isValidLocale(importedDefaultLocale)) ? importedDefaultLocale : 'en';
if (!importedDefaultLocale || !isValidLocale(importedDefaultLocale)) {
  console.error(`i18n.ts: Imported defaultLocale ("${importedDefaultLocale}") is invalid or undefined. Using hardcoded fallback: "${effectiveDefaultLocale}".`);
}


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
  let determinedLocale: Locale;

  if (typeof rawLocale === 'string' && isValidLocale(rawLocale)) {
    determinedLocale = rawLocale;
  } else {
    console.warn(`i18n.ts: Invalid or undefined rawLocale "${rawLocale ?? 'undefined'}" received. Using effective default locale "${effectiveDefaultLocale}".`);
    determinedLocale = effectiveDefaultLocale;
  }
  
  let messagesToUse;

  try {
    console.log(`i18n.ts: Attempting to load messages for determinedLocale: "${determinedLocale}"`);
    messagesToUse = (await import(`./src/messages/${determinedLocale}.json`)).default;
    if (!messagesToUse || typeof messagesToUse !== 'object' || Object.keys(messagesToUse).length === 0) {
      console.error(`i18n.ts: Loaded empty or invalid messages for locale: ${determinedLocale}.`);
      // Trigger fallback by throwing, will be caught below
      throw new Error(`Empty/invalid messages for ${determinedLocale}.`);
    }
  } catch (error) {
    // This catch block handles failure to load messages for 'determinedLocale'
    console.warn(`i18n.ts: Failed to load messages for locale "${determinedLocale}". Attempting fallback to default locale "${effectiveDefaultLocale}". Error: ${error instanceof Error ? error.message : String(error)}`);
    if (determinedLocale !== effectiveDefaultLocale) {
      try {
        console.log(`i18n.ts: Attempting to load messages for fallback defaultLocale: "${effectiveDefaultLocale}"`);
        messagesToUse = (await import(`./src/messages/${effectiveDefaultLocale}.json`)).default;
        if (!messagesToUse || typeof messagesToUse !== 'object' || Object.keys(messagesToUse).length === 0) {
          console.error(`i18n.ts: Fallback default locale messages ("${effectiveDefaultLocale}") are also missing, empty, or invalid.`);
          throw new Error(`Critical: Default locale messages ("${effectiveDefaultLocale}") also failed to load or are invalid.`);
        }
        determinedLocale = effectiveDefaultLocale; // IMPORTANT: Update determinedLocale because we are now using default locale's messages
        console.log(`i18n.ts: Successfully loaded fallback messages for "${determinedLocale}".`);
      } catch (fallbackError) {
        console.error(`i18n.ts: Critical error: Failed to load fallback default locale messages ("${effectiveDefaultLocale}"): ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        messagesToUse = {}; // Ultimate fallback: empty messages
        // determinedLocale here would be the original 'determinedLocale' if it wasn't the default, or 'effectiveDefaultLocale' if it was.
        // We must ensure determinedLocale is a valid Locale string.
        if (!isValidLocale(determinedLocale)) {
            console.error(`i18n.ts: determinedLocale became invalid ("${determinedLocale}") in deep fallback. Resetting to effectiveDefaultLocale.`);
            determinedLocale = effectiveDefaultLocale;
        }
      }
    } else {
      // This means the original determinedLocale was already effectiveDefaultLocale, and it failed to load.
      console.error(`i18n.ts: Critical error: Default locale messages ("${effectiveDefaultLocale}") are missing, empty, or invalid.`);
      messagesToUse = {}; // Ultimate fallback: empty messages
      // determinedLocale is already effectiveDefaultLocale and should be valid.
    }
  }

  // Final check to ensure `determinedLocale` is a valid locale string before returning.
  if (!isValidLocale(determinedLocale)) {
    console.error(`i18n.ts: determinedLocale ("${determinedLocale}") is invalid before returning. Forcing to effectiveDefaultLocale ("${effectiveDefaultLocale}"). This indicates a severe logic flaw.`);
    determinedLocale = effectiveDefaultLocale;
  }


  return {
    locale: determinedLocale, // This is the locale for which messages (messagesToUse) are being returned.
    messages: messagesToUse
  };
});

