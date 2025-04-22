"use client";

/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 *
 * @module i18n/settings
 *
 * @description Defines the locales, default locale, and other settings required for next-intl to function correctly.
 * This file configures the internationalization settings for the application, specifying supported locales,
 * the default locale, and whether a locale prefix should be added to default locale URLs.
 */

/**
 * @constant {readonly string[]} Locales - A list of supported locales in the application.
 */
export const Locales = ['en', 'fr'] as const;

/**
 * @constant {string} localePrefix - Configuration for the locale prefix in URLs.
 * Can be 'as-needed' to only include the locale in non-default locales, or 'always' to always include it.
 */
export const localePrefix = 'as-needed';

/**
 * @typedef {typeof Locales[number]} Locale - A type representing a valid locale string.
 */
export type Locale = typeof Locales[number];

/**
 * @constant {object} pathnames - Defines pathnames that should be localized.
 * The keys are the canonical pathnames (usually English) and the values are objects
 * containing locale-specific variations.
 */
export const pathnames = {
  '/': '/',
} as const;

/**
 * @constant {string} DefaultLocale - The default locale for the application.
 */
export const DefaultLocale = 'en';

/**
 * @function isValidLocale
 * @param {string} locale - The locale string to validate.
 * @returns {boolean} True if the locale is in the Locales array, false otherwise.
 */
export function isValidLocale(locale: string): boolean {
  return Locales.includes(locale as any);
}

/**
 * @constant {object} i18n - Configuration object for internationalization.
 * This object encapsulates the settings for locales, default locale, locale prefix, and pathnames.
 */
const i18n = {
  Locales,
  DefaultLocale,
  localePrefix,
  pathnames,
  isValidLocale,
};

export default i18n;
